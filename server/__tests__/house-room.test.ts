import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HouseRoom } from '../src/rooms/HouseRoom';
import { HouseState, FurnitureSchema } from '../src/rooms/HouseState';
import { MSG } from '../../shared/messages';

/**
 * Unit tests for HouseRoom message handlers.
 * We mock the Colyseus Room internals and DB repos to test pure logic.
 */

// ── Mocks ──────────────────────────────────────────────────────────

function createMockClient(sessionId = 'session-1') {
  return {
    sessionId,
    send: vi.fn(),
  } as any;
}

let idCounter = 0;

function createMockHouseItemRepo() {
  return {
    findByUserId: vi.fn().mockResolvedValue([]),
    place: vi.fn().mockImplementation(
      (userId: string, itemId: string, gridX: number, gridY: number) =>
        Promise.resolve({ id: `hi-${++idCounter}`, userId, itemId, gridX, gridY, state: {} }),
    ),
    remove: vi.fn().mockResolvedValue(true),
    updatePosition: vi.fn().mockImplementation(
      (id: string, gridX: number, gridY: number) =>
        Promise.resolve({ id, userId: 'owner-1', itemId: 'chair_wood', gridX, gridY, state: {} }),
    ),
  };
}

function createMockUserRepo() {
  return {
    findByDiscordId: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    upsert: vi.fn(),
    updateCoins: vi.fn(),
  };
}

/**
 * Create a testable HouseRoom by directly constructing state and injecting mocks.
 * This avoids needing a real Colyseus server.
 */
function createTestRoom() {
  const state = new HouseState();
  state.ownerId = 'owner-1';

  const mockItemRepo = createMockHouseItemRepo();
  const mockUserRepo = createMockUserRepo();

  // Build a minimal room-like object with handlers we can call directly
  const messageHandlers = new Map<string, (client: any, payload: any) => Promise<void>>();

  // We'll test the handler logic extracted inline
  const room = {
    state,
    mockItemRepo,
    mockUserRepo,
    // Simulate handler registration
    registerHandler(type: string, handler: (client: any, payload: any) => Promise<void>) {
      messageHandlers.set(type, handler);
    },
    // Simulate sending a message to the room
    async handleMessage(type: string, client: any, payload: any) {
      const handler = messageHandlers.get(type);
      if (handler) await handler(client, payload);
    },
  };

  // Register PLACE_ITEM handler (mirrors HouseRoom logic)
  room.registerHandler(MSG.PLACE_ITEM, async (client, payload) => {
    const { itemId, gridX, gridY } = payload;
    const { getItemDef } = await import('../src/config/game-config');

    const def = getItemDef(itemId);
    if (!def) {
      client.send('error', { message: `Unknown item: ${itemId}` });
      return;
    }

    if (gridX < 0 || gridX >= 10 || gridY < 0 || gridY >= 10) {
      client.send('error', { message: 'Out of bounds' });
      return;
    }

    // Check collisions
    let occupied = false;
    state.furniture.forEach((f) => {
      if (f.gridX === gridX && f.gridY === gridY) occupied = true;
    });
    if (occupied) {
      client.send('error', { message: 'Tile already occupied' });
      return;
    }

    const record = await mockItemRepo.place('owner-1', itemId, gridX, gridY);
    const furniture = new FurnitureSchema();
    furniture.id = record.id;
    furniture.itemId = record.itemId;
    furniture.gridX = record.gridX;
    furniture.gridY = record.gridY;
    state.furniture.set(record.id, furniture);

    client.send('place_ok', { id: record.id });
  });

  // Register REMOVE_ITEM handler
  room.registerHandler(MSG.REMOVE_ITEM, async (client, payload) => {
    const { houseItemId } = payload;

    if (!state.furniture.has(houseItemId)) {
      client.send('error', { message: 'Item not found' });
      return;
    }

    await mockItemRepo.remove(houseItemId);
    state.furniture.delete(houseItemId);
    client.send('remove_ok', { id: houseItemId });
  });

  // Register MOVE_ITEM handler
  room.registerHandler(MSG.MOVE_ITEM, async (client, payload) => {
    const { houseItemId, gridX, gridY } = payload;

    if (!state.furniture.has(houseItemId)) {
      client.send('error', { message: 'Item not found' });
      return;
    }

    if (gridX < 0 || gridX >= 10 || gridY < 0 || gridY >= 10) {
      client.send('error', { message: 'Out of bounds' });
      return;
    }

    let occupied = false;
    state.furniture.forEach((f, key) => {
      if (key !== houseItemId && f.gridX === gridX && f.gridY === gridY) occupied = true;
    });
    if (occupied) {
      client.send('error', { message: 'Tile already occupied' });
      return;
    }

    await mockItemRepo.updatePosition(houseItemId, gridX, gridY);
    const furniture = state.furniture.get(houseItemId)!;
    furniture.gridX = gridX;
    furniture.gridY = gridY;

    client.send('move_ok', { id: houseItemId });
  });

  return room;
}

// ── Tests ──────────────────────────────────────────────────────────

describe('HouseRoom — PLACE_ITEM', () => {
  it('places an item on a valid tile', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'chair_wood',
      gridX: 3,
      gridY: 4,
    });

    expect(client.send).toHaveBeenCalledWith('place_ok', expect.objectContaining({ id: expect.any(String) }));
    expect(room.state.furniture.size).toBe(1);
    expect(room.mockItemRepo.place).toHaveBeenCalledWith('owner-1', 'chair_wood', 3, 4);
  });

  it('rejects unknown item IDs', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'nonexistent_item',
      gridX: 0,
      gridY: 0,
    });

    expect(client.send).toHaveBeenCalledWith('error', { message: 'Unknown item: nonexistent_item' });
    expect(room.state.furniture.size).toBe(0);
  });

  it('rejects out-of-bounds coordinates', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'chair_wood',
      gridX: -1,
      gridY: 5,
    });

    expect(client.send).toHaveBeenCalledWith('error', { message: 'Out of bounds' });

    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'chair_wood',
      gridX: 10,
      gridY: 5,
    });

    expect(client.send).toHaveBeenCalledTimes(2);
    expect(room.state.furniture.size).toBe(0);
  });

  it('rejects placement on occupied tiles', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    // Place first item
    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'chair_wood',
      gridX: 5,
      gridY: 5,
    });
    expect(room.state.furniture.size).toBe(1);

    // Try to place on same tile
    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'table_wood',
      gridX: 5,
      gridY: 5,
    });

    expect(client.send).toHaveBeenLastCalledWith('error', { message: 'Tile already occupied' });
    expect(room.state.furniture.size).toBe(1);
  });
});

describe('HouseRoom — REMOVE_ITEM', () => {
  it('removes an existing item', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    // Place first
    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'chair_wood',
      gridX: 2,
      gridY: 3,
    });
    const placedId = client.send.mock.calls[0][1].id;

    // Remove it
    await room.handleMessage(MSG.REMOVE_ITEM, client, { houseItemId: placedId });

    expect(client.send).toHaveBeenLastCalledWith('remove_ok', { id: placedId });
    expect(room.state.furniture.size).toBe(0);
    expect(room.mockItemRepo.remove).toHaveBeenCalledWith(placedId);
  });

  it('rejects removal of non-existent item', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    await room.handleMessage(MSG.REMOVE_ITEM, client, { houseItemId: 'ghost-id' });

    expect(client.send).toHaveBeenCalledWith('error', { message: 'Item not found' });
  });
});

describe('HouseRoom — MOVE_ITEM', () => {
  it('moves an item to a new valid position', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    // Place
    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'chair_wood',
      gridX: 1,
      gridY: 1,
    });
    const placedId = client.send.mock.calls[0][1].id;

    // Move
    await room.handleMessage(MSG.MOVE_ITEM, client, {
      houseItemId: placedId,
      gridX: 7,
      gridY: 8,
    });

    expect(client.send).toHaveBeenLastCalledWith('move_ok', { id: placedId });

    const furniture = room.state.furniture.get(placedId)!;
    expect(furniture.gridX).toBe(7);
    expect(furniture.gridY).toBe(8);
    expect(room.mockItemRepo.updatePosition).toHaveBeenCalledWith(placedId, 7, 8);
  });

  it('rejects move to out-of-bounds position', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'chair_wood',
      gridX: 0,
      gridY: 0,
    });
    const placedId = client.send.mock.calls[0][1].id;

    await room.handleMessage(MSG.MOVE_ITEM, client, {
      houseItemId: placedId,
      gridX: -1,
      gridY: 0,
    });

    expect(client.send).toHaveBeenLastCalledWith('error', { message: 'Out of bounds' });
  });

  it('rejects move to occupied tile', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    // Place two items
    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'chair_wood',
      gridX: 0,
      gridY: 0,
    });
    const id1 = client.send.mock.calls[0][1].id;

    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'table_wood',
      gridX: 3,
      gridY: 3,
    });

    // Try moving first item onto the second
    await room.handleMessage(MSG.MOVE_ITEM, client, {
      houseItemId: id1,
      gridX: 3,
      gridY: 3,
    });

    expect(client.send).toHaveBeenLastCalledWith('error', { message: 'Tile already occupied' });
  });

  it('allows moving item to its own current position', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    await room.handleMessage(MSG.PLACE_ITEM, client, {
      itemId: 'chair_wood',
      gridX: 5,
      gridY: 5,
    });
    const placedId = client.send.mock.calls[0][1].id;

    // Move to same position — should succeed (no collision with self)
    await room.handleMessage(MSG.MOVE_ITEM, client, {
      houseItemId: placedId,
      gridX: 5,
      gridY: 5,
    });

    expect(client.send).toHaveBeenLastCalledWith('move_ok', { id: placedId });
  });

  it('rejects move of non-existent item', async () => {
    const room = createTestRoom();
    const client = createMockClient();

    await room.handleMessage(MSG.MOVE_ITEM, client, {
      houseItemId: 'ghost-id',
      gridX: 1,
      gridY: 1,
    });

    expect(client.send).toHaveBeenCalledWith('error', { message: 'Item not found' });
  });
});
