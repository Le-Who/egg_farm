import { Client, Room } from "colyseus.js";
import { EventBridge } from "../EventBridge";
import { MSG } from "../../../shared/messages";
import { HouseState } from "../../../shared/HouseState";
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
} from "../../../shared/messages";

const WS_URL = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

let client: Client;
let room: Room<HouseState> | null = null;

function getClient() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const endpoint = `${protocol}://${window.location.hostname}:3000`;
  return new Client(endpoint);
}

/** Join (or create) the player's house room */
export async function joinHouseRoom(
  ownerId: string,
  discordId: string,
): Promise<Room<HouseState>> {
  const c = getClient();
  room = await c.joinOrCreate("house", { ownerId, discordId });

  globalMyDiscordId = discordId;

  registerMessageHandlers(room);

  if (!sdkHandlersInitialized) {
    setupEventBridgeListeners();
    sdkHandlersInitialized = true;
  }

  return room;
}

/** Visit a friend's house by their Discord ID */
export async function joinFriendRoom(
  friendDiscordId: string,
  myDiscordId: string,
): Promise<Room<HouseState>> {
  const c = getClient();
  room = await c.joinOrCreate("house", {
    ownerId: friendDiscordId,
    discordId: myDiscordId,
  });

  registerMessageHandlers(room);

  EventBridge.emit("room_joined", {
    ownerId: friendDiscordId,
    isVisiting: true,
  });
  return room;
}

let sdkHandlersInitialized = false;

function setupEventBridgeListeners() {
  // ── Sprint 1: Furniture placement messages ──
  EventBridge.on("place_item", (payload: PlaceItemPayload) => {
    room?.send(MSG.PLACE_ITEM, payload);
  });

  EventBridge.on("remove_item", (payload: RemoveItemPayload) => {
    room?.send(MSG.REMOVE_ITEM, payload);
  });

  EventBridge.on("move_item", (payload: MoveItemPayload) => {
    room?.send(MSG.MOVE_ITEM, payload);
  });

  // ── Sprint 2: Planting, harvesting, and shopping messages ──
  EventBridge.on("plant_seed", (payload: PlantSeedPayload) => {
    room?.send(MSG.PLANT_SEED, payload);
  });

  EventBridge.on("harvest", (payload: HarvestPayload) => {
    room?.send(MSG.HARVEST, payload);
  });

  EventBridge.on("buy_item", (payload: BuyItemPayload) => {
    room?.send(MSG.BUY_ITEM, payload);
  });

  // ── Sprint 3: Pet and visiting messages ──
  EventBridge.on("hatch_egg", (payload: HatchEggPayload) => {
    room?.send(MSG.HATCH_EGG, payload);
  });

  EventBridge.on("set_active_pet", (payload: SetActivePetPayload) => {
    room?.send(MSG.SET_ACTIVE_PET, payload);
  });

  EventBridge.on("visit_friend", (data: { discordId: string }) => {
    // Leave current room and join friend's room
    room?.leave();
    room = null;
    // We need 'myDiscordId' here but it's not passed in data?
    // We can assume the room stores it or we need to track it?
    // For now, let's assume the previous room had it.
    // Wait, joinFriendRoom needs myDiscordId.
    // We should store it in a module variable or pass it.
    // For MVP/Demo, let's use a stored variable or fail?
    // 'currentOwnerId' vs 'myDiscordId'.
    // Let's store myDiscordId in joinHouseRoom.
    if (globalMyDiscordId) {
      joinFriendRoom(data.discordId, globalMyDiscordId);
    } else {
      console.error("Missing myDiscordId for visit");
    }
  });

  EventBridge.on("purchase_gems", (payload: PurchaseGemsPayload) => {
    room?.send(MSG.PURCHASE_GEMS, payload);
  });
}

function registerMessageHandlers(room: Room<HouseState>) {
  // Listen for state changes and forward to EventBridge
  room.state.furniture.onAdd((furniture: any, key: string) => {
    EventBridge.emit("furniture_added", {
      id: key,
      itemId: furniture.itemId,
      gridX: furniture.gridX,
      gridY: furniture.gridY,
    });
  });

  room.state.furniture.onRemove((_furniture: any, key: string) => {
    EventBridge.emit("furniture_removed", key);
  });

  // Silence "onMessage() not registered" warnings for simple ack messages
  room.onMessage("place_ok", () => {});
  room.onMessage("remove_ok", () => {});

  // ── Server responses ──
  room.onMessage("error", (data: { message: string }) => {
    console.warn("[Server Error]", data.message);
    EventBridge.emit("server_error", data.message);
  });

  room.onMessage(
    "purchase_ok",
    (data: { skuId: string; gemsGranted: number; newGemBalance: number }) => {
      EventBridge.emit("gems_updated", data.newGemBalance);
      EventBridge.emit("purchase_complete", data);
    },
  );

  room.onMessage("buy_ok", (data: { newBalance: number }) => {
    EventBridge.emit("coins_updated", data.newBalance);
  });

  room.onMessage("harvest_ok", (data: { coins: number }) => {
    EventBridge.emit("harvest_complete", data);
  });

  room.onMessage(
    "hatch_ok",
    (data: {
      petType: string;
      petId: string;
      name: string;
      rarity: string;
    }) => {
      EventBridge.emit("pet_hatched", data);
    },
  );

  room.onMessage("pets_list", (pets: any[]) => {
    EventBridge.emit("pets_updated", pets);
  });

  room.onMessage("inventory_list", (items: any[]) => {
    EventBridge.emit("inventory_updated", items);
  });
}

let globalMyDiscordId = "";

export function getRoom(): Room<HouseState> | null {
  return room;
}
