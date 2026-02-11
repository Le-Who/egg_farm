import { Client } from "colyseus.js";
import { EventBridge } from "../EventBridge";
import { MSG } from "../../../shared/messages";
const WS_URL = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
let client;
let room = null;
function getClient() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const endpoint = `${protocol}://${window.location.hostname}:3000`;
    return new Client(endpoint);
}
/** Join (or create) the player's house room */
export async function joinHouseRoom(ownerId, discordId) {
    const c = getClient();
    room = await c.joinOrCreate("house", { ownerId, discordId });
    // Listen for state changes and forward to EventBridge
    room.state.furniture.onAdd((furniture, key) => {
        EventBridge.emit("furniture_added", {
            id: key,
            itemId: furniture.itemId,
            gridX: furniture.gridX,
            gridY: furniture.gridY,
        });
    });
    room.state.furniture.onRemove((_furniture, key) => {
        EventBridge.emit("furniture_removed", key);
    });
    // ── Sprint 1: Furniture placement messages ──
    EventBridge.on("place_item", (payload) => {
        room?.send(MSG.PLACE_ITEM, payload);
    });
    EventBridge.on("remove_item", (payload) => {
        room?.send(MSG.REMOVE_ITEM, payload);
    });
    EventBridge.on("move_item", (payload) => {
        room?.send(MSG.MOVE_ITEM, payload);
    });
    // Silence "onMessage() not registered" warnings for simple ack messages
    room.onMessage("place_ok", () => {
        /* items are synced via state */
    });
    room.onMessage("remove_ok", () => {
        /* items are synced via state */
    });
    // ── Sprint 2: Planting, harvesting, and shopping messages ──
    EventBridge.on("plant_seed", (payload) => {
        room?.send(MSG.PLANT_SEED, payload);
    });
    EventBridge.on("harvest", (payload) => {
        room?.send(MSG.HARVEST, payload);
    });
    EventBridge.on("buy_item", (payload) => {
        room?.send(MSG.BUY_ITEM, payload);
    });
    // ── Sprint 3: Pet and visiting messages ──
    EventBridge.on("hatch_egg", (payload) => {
        room?.send(MSG.HATCH_EGG, payload);
    });
    EventBridge.on("set_active_pet", (payload) => {
        room?.send(MSG.SET_ACTIVE_PET, payload);
    });
    EventBridge.on("visit_friend", (data) => {
        // Leave current room and join friend's room
        room?.leave();
        room = null;
        joinFriendRoom(data.discordId, discordId);
    });
    EventBridge.on("purchase_gems", (payload) => {
        room?.send(MSG.PURCHASE_GEMS, payload);
    });
    // ── Server responses ──
    room.onMessage("error", (data) => {
        console.warn("[Server Error]", data.message);
        EventBridge.emit("server_error", data.message);
    });
    room.onMessage("purchase_ok", (data) => {
        EventBridge.emit("gems_updated", data.newGemBalance);
        EventBridge.emit("purchase_complete", data);
    });
    room.onMessage("buy_ok", (data) => {
        EventBridge.emit("coins_updated", data.newBalance);
    });
    room.onMessage("harvest_ok", (data) => {
        EventBridge.emit("harvest_complete", data);
    });
    room.onMessage("hatch_ok", (data) => {
        EventBridge.emit("pet_hatched", data);
    });
    room.onMessage("pets_list", (pets) => {
        EventBridge.emit("pets_updated", pets);
    });
    room.onMessage("inventory_list", (items) => {
        EventBridge.emit("inventory_updated", items);
    });
    return room;
}
/** Visit a friend's house by their Discord ID */
export async function joinFriendRoom(friendDiscordId, myDiscordId) {
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
export function getRoom() {
    return room;
}
