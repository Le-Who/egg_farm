import { Client, Room } from "colyseus.js";
import { EventBridge } from "../EventBridge";
import { MSG } from "../../../shared/messages";
import type {
  PlaceItemPayload,
  RemoveItemPayload,
  MoveItemPayload,
  PlantSeedPayload,
  HarvestPayload,
  BuyItemPayload,
  HatchEggPayload,
  SetActivePetPayload,
} from "../../../shared/messages";

const WS_URL = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

let client: Client;
let room: Room | null = null;

export function getClient(): Client {
  if (!client) {
    client = new Client(WS_URL);
  }
  return client;
}

/** Join (or create) the player's house room */
export async function joinHouseRoom(
  ownerId: string,
  discordId: string,
): Promise<Room> {
  const c = getClient();
  room = await c.joinOrCreate("house", { ownerId, discordId });

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
    joinFriendRoom(data.discordId, discordId);
  });

  // ── Server responses ──
  room.onMessage("error", (data: { message: string }) => {
    console.warn("[Server Error]", data.message);
    EventBridge.emit("server_error", data.message);
  });

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

  return room;
}

/** Visit a friend's house by their Discord ID */
export async function joinFriendRoom(
  friendDiscordId: string,
  myDiscordId: string,
): Promise<Room> {
  const c = getClient();
  room = await c.joinOrCreate("house", {
    ownerId: friendDiscordId,
    discordId: myDiscordId,
  });
  EventBridge.emit("room_joined", {
    ownerId: friendDiscordId,
    isVisiting: true,
  });
  return room;
}

export function getRoom(): Room | null {
  return room;
}
