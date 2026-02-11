import { Room, Client } from "@colyseus/core";
import {
  HouseState,
  FurnitureSchema,
  PlayerSchema,
} from "../../../shared/HouseState.js";
import { HouseItemRepo } from "../db/repositories/HouseItemRepo.js";
import { UserRepo } from "../db/repositories/UserRepo.js";
import { InventoryRepo } from "../db/repositories/InventoryRepo.js";
import { PetRepo } from "../db/repositories/PetRepo.js";
import { getItemDef } from "../config/game-config.js";
import { getPlantConfig } from "../config/plant-config.js";
import { getPetTypeConfig } from "../config/pet-config.js";
import { validateHarvest } from "../services/PlantingService.js";
import { openEgg } from "../services/IncubationService.js";
import { ShopService } from "../services/ShopService.js";
import { IAPService } from "../services/IAPService.js";
import { MSG } from "../../../shared/messages.js";
import type {
  PlaceItemPayload,
  RemoveItemPayload,
  MoveItemPayload,
  PlantSeedPayload,
  HarvestPayload,
  BuyItemPayload,
  HatchEggPayload,
  SetActivePetPayload,
  PurchaseGemsPayload,
} from "../../../shared/messages.js";

// Grid boundaries for the MVP room
const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;

export class HouseRoom extends Room<HouseState> {
  private houseItemRepo = new HouseItemRepo();
  private userRepo = new UserRepo();
  private inventoryRepo = new InventoryRepo();
  private petRepo = new PetRepo();
  private shopService = new ShopService(this.userRepo, this.inventoryRepo);
  private iapService = new IAPService(this.userRepo, this.inventoryRepo);
  private ownerId: string = "";

  // Demo Mode In-Memory State
  private demoCoins: number = 500;
  private demoInventory: Map<string, number> = new Map([
    ["chair_wood", 2],
    ["table_wood", 1],
    ["rug_red", 1],
    ["seed_mint", 5],
    ["egg_basic", 1],
  ]);
  private demoPets: any[] = [
    {
      id: "demo-pet-1",
      petType: "slime_grass",
      name: "Demo Slime",
      level: 1,
      hunger: 80,
      isActive: true,
      rarity: "common",
    },
  ];

  async onCreate(options: { ownerId: string }) {
    this.setState(new HouseState());
    this.ownerId = options.ownerId;
    this.state.ownerId = options.ownerId;
    console.log(`[HouseRoom] Room created for owner: ${this.ownerId}`);

    // Hydrate from DB
    try {
      await this.loadFurniture();
    } catch (err) {
      console.error(
        "[HouseRoom] Failed to load furniture (DB Error?). Starting with empty state.",
        err,
      );
    }

    // Register message handlers
    this.onMessage(MSG.PLACE_ITEM, (client, payload: PlaceItemPayload) =>
      this.handlePlaceItem(client, payload),
    );
    this.onMessage(MSG.REMOVE_ITEM, (client, payload: RemoveItemPayload) =>
      this.handleRemoveItem(client, payload),
    );
    this.onMessage(MSG.MOVE_ITEM, (client, payload: MoveItemPayload) =>
      this.handleMoveItem(client, payload),
    );
    this.onMessage(MSG.PLANT_SEED, (client, payload: PlantSeedPayload) =>
      this.handlePlantSeed(client, payload),
    );
    this.onMessage(MSG.HARVEST, (client, payload: HarvestPayload) =>
      this.handleHarvest(client, payload),
    );
    this.onMessage(MSG.BUY_ITEM, (client, payload: BuyItemPayload) =>
      this.handleBuyItem(client, payload),
    );
    this.onMessage(MSG.HATCH_EGG, (client, payload: HatchEggPayload) =>
      this.handleHatchEgg(client, payload),
    );
    this.onMessage(MSG.SET_ACTIVE_PET, (client, payload: SetActivePetPayload) =>
      this.handleSetActivePet(client, payload),
    );
    this.onMessage(MSG.PURCHASE_GEMS, (client, payload: PurchaseGemsPayload) =>
      this.handlePurchaseGems(client, payload),
    );
  }

  async onJoin(
    client: Client,
    options: { ownerId: string; discordId: string; displayName?: string },
  ) {
    console.log(
      `[HouseRoom] Client joined: ${client.sessionId}, options:`,
      options,
    );
    // Stub for real auth check later
    // if (!await this.verifyToken(options.token)) ...discordId;
    const player = new PlayerSchema();
    player.odiscordId = options.discordId;
    player.odisplayName = options.displayName || "Unknown";
    this.state.players.set(client.sessionId, player);

    // Send initial non-schema state (Pets, Inventory)
    await this.sendPets(client);
    await this.sendInventory(client);
  }

  private async sendPets(client: Client) {
    let pets: any[] = [];
    try {
      pets = await this.petRepo.findByUserId(this.ownerId);
    } catch (err) {
      console.warn(
        "[HouseRoom] DB Error loading pets (Demo Mode): Sending mock pet.",
      );
      pets = this.demoPets;
    }
    client.send("pets_list", pets);
  }

  private async sendInventory(client: Client) {
    let items: any[] = [];
    try {
      items = await this.inventoryRepo.getByUserId(this.ownerId);
    } catch (err) {
      console.warn(
        "[HouseRoom] DB Error loading inventory (Demo Mode): Sending mock items.",
      );
      items = Array.from(this.demoInventory.entries()).map(
        ([itemId, quantity]) => ({
          itemId,
          quantity,
        }),
      );
    }
    client.send("inventory_list", items);
  }

  async onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  async onDispose() {
    // State already persisted on each mutation — nothing extra needed
  }

  // ── Message Handlers ──────────────────────────────────────────────

  private async handlePlaceItem(client: Client, payload: PlaceItemPayload) {
    const { itemId, gridX, gridY } = payload;

    // Validate item exists in config
    const def = getItemDef(itemId);
    if (!def) {
      client.send("error", { message: `Unknown item: ${itemId}` });
      return;
    }

    // Validate grid bounds
    if (!this.isInBounds(gridX, gridY)) {
      client.send("error", { message: "Out of bounds" });
      return;
    }

    // Check for collisions
    if (this.isTileOccupied(gridX, gridY)) {
      client.send("error", { message: "Tile already occupied" });
      return;
    }

    let record = { id: "", itemId, gridX, gridY };

    try {
      // Persist to DB
      record = await this.houseItemRepo.place(
        this.ownerId,
        itemId,
        gridX,
        gridY,
      );
      // Consume from inventory (if applicable logic exists for furniture)
      // MVP: We assume placement consumes 1 from inventory if it's not "unlimited"
      // But for now, let's just proceed.
    } catch (err) {
      console.warn("[HouseRoom] DB Error on place (Demo Mode):", err);
      // Fallback for demo: Check/Consume Demo Inventory
      const qty = this.demoInventory.get(itemId) || 0;
      if (qty > 0) {
        this.demoInventory.set(itemId, qty - 1);
        record.id = "demo-" + Math.random().toString(36).substr(2, 9);
      } else {
        client.send("error", { message: "Not enough items (Demo)" });
        return;
      }
    }

    // Update synced state
    const furniture = new FurnitureSchema();
    furniture.id = record.id;
    furniture.itemId = record.itemId;
    furniture.gridX = record.gridX;
    furniture.gridY = record.gridY;
    this.state.furniture.set(record.id, furniture);

    client.send("place_ok", { id: record.id });
  }

  private async handleRemoveItem(client: Client, payload: RemoveItemPayload) {
    const { houseItemId } = payload;

    if (!this.state.furniture.has(houseItemId)) {
      client.send("error", { message: "Item not found" });
      return;
    }

    try {
      await this.houseItemRepo.remove(houseItemId);
    } catch (err) {
      console.warn("[HouseRoom] DB Error on remove (Demo Mode):", err);
    }

    this.state.furniture.delete(houseItemId);

    client.send("remove_ok", { id: houseItemId });
  }

  private async handleMoveItem(client: Client, payload: MoveItemPayload) {
    const { houseItemId, gridX, gridY } = payload;

    if (!this.state.furniture.has(houseItemId)) {
      client.send("error", { message: "Item not found" });
      return;
    }

    if (!this.isInBounds(gridX, gridY)) {
      client.send("error", { message: "Out of bounds" });
      return;
    }

    // Check for collisions (ignore the item being moved)
    if (this.isTileOccupied(gridX, gridY, houseItemId)) {
      client.send("error", { message: "Tile already occupied" });
      return;
    }

    const updated = await this.houseItemRepo.updatePosition(
      houseItemId,
      gridX,
      gridY,
    );
    if (!updated) {
      client.send("error", { message: "Update failed" });
      return;
    }

    const furniture = this.state.furniture.get(houseItemId)!;
    furniture.gridX = gridX;
    furniture.gridY = gridY;

    client.send("move_ok", { id: houseItemId });
  }

  private async handlePlantSeed(client: Client, payload: PlantSeedPayload) {
    const { seedItemId, gridX, gridY } = payload;

    // Validate seed exists
    const plantCfg = getPlantConfig(seedItemId);
    if (!plantCfg) {
      client.send("error", { message: `Unknown seed: ${seedItemId}` });
      return;
    }

    if (!this.isInBounds(gridX, gridY)) {
      client.send("error", { message: "Out of bounds" });
      return;
    }

    if (this.isTileOccupied(gridX, gridY)) {
      client.send("error", { message: "Tile already occupied" });
      return;
    }

    // Deduct seed from inventory
    try {
      const removed = await this.inventoryRepo.removeItem(
        this.ownerId,
        seedItemId,
        1,
      );
      if (!removed) {
        client.send("error", { message: "No seeds in inventory" });
        return;
      }
    } catch (err) {
      // Demo fallback
      const qty = this.demoInventory.get(seedItemId) || 0;
      if (qty > 0) {
        this.demoInventory.set(seedItemId, qty - 1);
      } else {
        client.send("error", { message: "No seeds in inventory (Demo)" });
        return;
      }
    }

    let record = { id: "", itemId: seedItemId, gridX, gridY };

    try {
      // Place as a house_item with planting state
      record = await this.houseItemRepo.place(
        this.ownerId,
        seedItemId,
        gridX,
        gridY,
      );
    } catch (err) {
      // Demo fallback
      record.id = "demo-plant-" + Math.random().toString(36).substr(2, 9);
    }

    // TODO: update record state with planted_at timestamp via DB

    const furniture = new FurnitureSchema();
    furniture.id = record.id;
    furniture.itemId = record.itemId;
    furniture.gridX = record.gridX;
    furniture.gridY = record.gridY;
    this.state.furniture.set(record.id, furniture);

    client.send("plant_ok", { id: record.id, plantedAt: Date.now() });
  }

  private async handleHarvest(client: Client, payload: HarvestPayload) {
    const { houseItemId } = payload;

    const furniture = this.state.furniture.get(houseItemId);
    if (!furniture) {
      client.send("error", { message: "Item not found" });
      return;
    }

    // Validate harvest timing
    const plantCfg = validateHarvest(
      // For MVP, we use a simplified planted_at from state
      // In production, this would come from house_items.state JSONB
      Date.now() - 999999, // Placeholder: always harvestable for now
      furniture.itemId,
      Date.now(),
    );

    if (!plantCfg) {
      client.send("error", { message: "Not ready to harvest" });
      return;
    }

    // Grant rewards
    try {
      for (const yield_ of plantCfg.harvestYield) {
        await this.inventoryRepo.addItem(
          this.ownerId,
          yield_.itemId,
          yield_.quantity,
        );
      }
      await this.userRepo.updateCoins(this.ownerId, plantCfg.coinReward);

      // Clear the tile
      await this.houseItemRepo.remove(houseItemId);
    } catch (err) {
      // Demo logic
      for (const yield_ of plantCfg.harvestYield) {
        const current = this.demoInventory.get(yield_.itemId) || 0;
        this.demoInventory.set(yield_.itemId, current + yield_.quantity);
      }
      this.demoCoins += plantCfg.coinReward;
    }

    this.state.furniture.delete(houseItemId);

    client.send("harvest_ok", {
      id: houseItemId,
      rewards: plantCfg.harvestYield,
      coins: plantCfg.coinReward,
    });
  }

  private async handleBuyItem(client: Client, payload: BuyItemPayload) {
    try {
      const result = await this.shopService.buyItem(
        this.ownerId,
        payload.itemId,
        payload.quantity,
      );

      if (!result.success) {
        client.send("error", { message: result.error! });
        return;
      }

      client.send("buy_ok", {
        itemId: payload.itemId,
        quantity: payload.quantity,
        cost: result.cost,
        newBalance: result.newBalance,
      });
    } catch (err) {
      console.warn("[HouseRoom] DB Error on buy (Demo Mode):", err);
      // Mock success for demo
      const itemDef = getItemDef(payload.itemId);
      const cost = (itemDef?.price || 10) * payload.quantity;

      if (this.demoCoins >= cost) {
        this.demoCoins -= cost;
        const currentQty = this.demoInventory.get(payload.itemId) || 0;
        this.demoInventory.set(payload.itemId, currentQty + payload.quantity);

        client.send("buy_ok", {
          itemId: payload.itemId,
          quantity: payload.quantity,
          cost: cost,
          newBalance: this.demoCoins,
        });
      } else {
        client.send("error", { message: "Not enough coins (Demo)" });
      }
    }
  }

  private async handleHatchEgg(client: Client, _payload: HatchEggPayload) {
    try {
      // Check if player has an egg in inventory
      const hasEgg = await this.inventoryRepo.getItem(
        this.ownerId,
        "egg_basic",
      );
      if (!hasEgg || hasEgg.quantity < 1) {
        client.send("error", { message: "No eggs in inventory" });
        return;
      }
      // Consume the egg
      await this.inventoryRepo.removeItem(this.ownerId, "egg_basic", 1);
    } catch (err) {
      console.warn(
        "[HouseRoom] DB Error on hatch (Demo Mode): Checking demo inventory.",
        err,
      );
      const eggs = this.demoInventory.get("egg_basic") || 0;
      if (eggs < 1) {
        client.send("error", { message: "No eggs in inventory (Demo)" });
        return;
      }
      this.demoInventory.set("egg_basic", eggs - 1);
    }

    // Gacha roll (pure function, no DB)
    const rolled = openEgg();

    let petId = "demo-pet-" + Math.random().toString(36).substr(2, 9);

    try {
      // Create pet in DB
      const pet = await this.petRepo.create(this.ownerId, rolled.petType);
      petId = pet.id;
    } catch (err) {
      console.warn(
        "[HouseRoom] DB Error on create pet (Demo Mode): Using mock ID.",
        err,
      );
      this.demoPets.push({
        id: petId,
        petType: rolled.petType,
        name: rolled.name,
        level: 1,
        hunger: 100,
        isActive: false,
        rarity: rolled.rarity,
      });
    }

    client.send("hatch_ok", {
      petId: petId,
      petType: rolled.petType,
      name: rolled.name,
      rarity: rolled.rarity,
    });
  }

  private async handleSetActivePet(
    client: Client,
    payload: SetActivePetPayload,
  ) {
    const { petId } = payload;

    try {
      const success = await this.petRepo.setActive(this.ownerId, petId);
      if (!success) {
        client.send("error", { message: "Pet not found" });
        return;
      }

      const pet = await this.petRepo.findById(petId);
      const config = pet ? getPetTypeConfig(pet.petType) : null;

      client.send("pet_activated", {
        petId,
        growthSpeedMod: config?.growthSpeedMod ?? 1,
      });
    } catch (err) {
      console.warn("[HouseRoom] DB Error setActive (Demo Mode)", err);
      // Demo logic
      const pet = this.demoPets.find((p) => p.id === petId);
      if (pet) {
        this.demoPets.forEach((p) => (p.isActive = false));
        pet.isActive = true;

        const config = getPetTypeConfig(pet.petType);
        client.send("pet_activated", {
          petId,
          growthSpeedMod: config?.growthSpeedMod ?? 1,
        });
      }
    }
  }

  private async handlePurchaseGems(
    client: Client,
    payload: PurchaseGemsPayload,
  ) {
    try {
      const result = await this.iapService.fulfillPurchase(
        this.ownerId,
        payload.skuId,
        payload.purchaseToken,
      );

      if (!result.success) {
        client.send("error", { message: result.error ?? "Purchase failed" });
        return;
      }

      client.send("purchase_ok", {
        skuId: payload.skuId,
        gemsGranted: result.gemsGranted,
        newGemBalance: result.newGemBalance,
      });
    } catch (err) {
      console.warn("[HouseRoom] DB Error on IAP (Demo Mode):", err);
      client.send("purchase_ok", {
        skuId: payload.skuId,
        gemsGranted: 100,
        newGemBalance: 9999,
      });
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────

  private async loadFurniture() {
    const items = await this.houseItemRepo.findByUserId(this.ownerId);
    for (const item of items) {
      const furniture = new FurnitureSchema();
      furniture.id = item.id;
      furniture.itemId = item.itemId;
      furniture.gridX = item.gridX;
      furniture.gridY = item.gridY;
      this.state.furniture.set(item.id, furniture);
    }
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
  }

  private isTileOccupied(x: number, y: number, excludeId?: string): boolean {
    let occupied = false;
    this.state.furniture.forEach((f: FurnitureSchema, key: string) => {
      if (key !== excludeId && f.gridX === x && f.gridY === y) {
        occupied = true;
      }
    });
    return occupied;
  }
}
