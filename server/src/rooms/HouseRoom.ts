import { Room, Client } from '@colyseus/core';
import { HouseState, FurnitureSchema, PlayerSchema } from './HouseState.js';
import { HouseItemRepo } from '../db/repositories/HouseItemRepo.js';
import { UserRepo } from '../db/repositories/UserRepo.js';
import { getItemDef } from '../config/game-config.js';
import { MSG } from '../../../shared/messages.js';
import type { PlaceItemPayload, RemoveItemPayload, MoveItemPayload } from '../../../shared/messages.js';

// Grid boundaries for the MVP room
const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;

export class HouseRoom extends Room<HouseState> {
  private houseItemRepo = new HouseItemRepo();
  private userRepo = new UserRepo();
  private ownerId: string = '';

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
  }

  async onJoin(client: Client, options: { discordId: string; displayName?: string }) {
    const player = new PlayerSchema();
    player.odiscordId = options.discordId;
    player.odisplayName = options.displayName ?? 'Guest';
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
      client.send('error', { message: `Unknown item: ${itemId}` });
      return;
    }

    // Validate grid bounds
    if (!this.isInBounds(gridX, gridY)) {
      client.send('error', { message: 'Out of bounds' });
      return;
    }

    // Check for collisions
    if (this.isTileOccupied(gridX, gridY)) {
      client.send('error', { message: 'Tile already occupied' });
      return;
    }

    // Persist to DB
    const record = await this.houseItemRepo.place(this.ownerId, itemId, gridX, gridY);

    // Update synced state
    const furniture = new FurnitureSchema();
    furniture.id = record.id;
    furniture.itemId = record.itemId;
    furniture.gridX = record.gridX;
    furniture.gridY = record.gridY;
    this.state.furniture.set(record.id, furniture);

    client.send('place_ok', { id: record.id });
  }

  private async handleRemoveItem(client: Client, payload: RemoveItemPayload) {
    const { houseItemId } = payload;

    if (!this.state.furniture.has(houseItemId)) {
      client.send('error', { message: 'Item not found' });
      return;
    }

    await this.houseItemRepo.remove(houseItemId);
    this.state.furniture.delete(houseItemId);

    client.send('remove_ok', { id: houseItemId });
  }

  private async handleMoveItem(client: Client, payload: MoveItemPayload) {
    const { houseItemId, gridX, gridY } = payload;

    if (!this.state.furniture.has(houseItemId)) {
      client.send('error', { message: 'Item not found' });
      return;
    }

    if (!this.isInBounds(gridX, gridY)) {
      client.send('error', { message: 'Out of bounds' });
      return;
    }

    // Check for collisions (ignore the item being moved)
    if (this.isTileOccupied(gridX, gridY, houseItemId)) {
      client.send('error', { message: 'Tile already occupied' });
      return;
    }

    const updated = await this.houseItemRepo.updatePosition(houseItemId, gridX, gridY);
    if (!updated) {
      client.send('error', { message: 'Update failed' });
      return;
    }

    const furniture = this.state.furniture.get(houseItemId)!;
    furniture.gridX = gridX;
    furniture.gridY = gridY;

    client.send('move_ok', { id: houseItemId });
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
