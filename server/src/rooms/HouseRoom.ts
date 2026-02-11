import { Room, Client } from "@colyseus/core";
import { HouseState, FurnitureSchema, PlayerSchema } from "./HouseState.js";
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
  private ownerId: string = "";

  async onCreate(options: { ownerId: string }) {
    this.setState(new HouseState());
    this.ownerId = options.ownerId;
    this.state.ownerId = options.ownerId;

    // Hydrate from DB
    await this.loadFurniture();

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
  }

  async onJoin(
    client: Client,
    options: { discordId: string; displayName?: string },
  ) {
    const player = new PlayerSchema();
    player.odiscordId = options.discordId;
    player.odisplayName = options.displayName ?? "Guest";
    this.state.players.set(client.sessionId, player);
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

    // Persist to DB
    const record = await this.houseItemRepo.place(
      this.ownerId,
      itemId,
      gridX,
      gridY,
    );

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

    await this.houseItemRepo.remove(houseItemId);
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
    const removed = await this.inventoryRepo.removeItem(
      this.ownerId,
      seedItemId,
      1,
    );
    if (!removed) {
      client.send("error", { message: "No seeds in inventory" });
      return;
    }

    // Place as a house_item with planting state
    const record = await this.houseItemRepo.place(
      this.ownerId,
      seedItemId,
      gridX,
      gridY,
    );
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
    this.state.furniture.delete(houseItemId);

    client.send("harvest_ok", {
      id: houseItemId,
      rewards: plantCfg.harvestYield,
      coins: plantCfg.coinReward,
    });
  }

  private async handleBuyItem(client: Client, payload: BuyItemPayload) {
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
  }

  private async handleHatchEgg(client: Client, _payload: HatchEggPayload) {
    // Check if player has an egg in inventory
    const hasEgg = await this.inventoryRepo.getItem(this.ownerId, "egg_basic");
    if (!hasEgg || hasEgg.quantity < 1) {
      client.send("error", { message: "No eggs in inventory" });
      return;
    }

    // Consume the egg
    await this.inventoryRepo.removeItem(this.ownerId, "egg_basic", 1);

    // Gacha roll
    const rolled = openEgg();

    // Create pet in DB
    const pet = await this.petRepo.create(this.ownerId, rolled.petType);

    client.send("hatch_ok", {
      petId: pet.id,
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
    this.state.furniture.forEach((f, key) => {
      if (key !== excludeId && f.gridX === x && f.gridY === y) {
        occupied = true;
      }
    });
    return occupied;
  }
}
