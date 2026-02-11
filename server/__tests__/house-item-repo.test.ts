import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HouseItemRepo } from '../src/db/repositories/HouseItemRepo';

function createMockPool() {
  return {
    query: vi.fn(),
  } as any;
}

describe('HouseItemRepo', () => {
  let pool: ReturnType<typeof createMockPool>;
  let repo: HouseItemRepo;

  beforeEach(() => {
    pool = createMockPool();
    repo = new HouseItemRepo(pool);
  });

  describe('findByUserId', () => {
    it('returns array of items for a user', async () => {
      const items = [
        { id: 'hi-1', userId: 'u1', itemId: 'chair_wood', gridX: 2, gridY: 3, state: {} },
        { id: 'hi-2', userId: 'u1', itemId: 'table_wood', gridX: 5, gridY: 1, state: {} },
      ];
      pool.query.mockResolvedValue({ rows: items });

      const result = await repo.findByUserId('u1');

      expect(result).toHaveLength(2);
      expect(result[0].itemId).toBe('chair_wood');
    });

    it('returns empty array when user has no items', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await repo.findByUserId('u-empty');
      expect(result).toEqual([]);
    });
  });

  describe('place', () => {
    it('inserts a new house item', async () => {
      const placed = {
        id: 'hi-new',
        userId: 'u1',
        itemId: 'chair_wood',
        gridX: 4,
        gridY: 7,
        state: {},
      };
      pool.query.mockResolvedValue({ rows: [placed] });

      const result = await repo.place('u1', 'chair_wood', 4, 7);

      expect(result.id).toBe('hi-new');
      expect(result.gridX).toBe(4);
      expect(result.gridY).toBe(7);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        ['u1', 'chair_wood', 4, 7],
      );
    });
  });

  describe('remove', () => {
    it('returns true when item was deleted', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const result = await repo.remove('hi-1');
      expect(result).toBe(true);
    });

    it('returns false when item was not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const result = await repo.remove('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('updatePosition', () => {
    it('updates and returns the item with new coords', async () => {
      const updated = {
        id: 'hi-1',
        userId: 'u1',
        itemId: 'chair_wood',
        gridX: 8,
        gridY: 2,
        state: {},
      };
      pool.query.mockResolvedValue({ rows: [updated] });

      const result = await repo.updatePosition('hi-1', 8, 2);

      expect(result).toBeDefined();
      expect(result!.gridX).toBe(8);
      expect(result!.gridY).toBe(2);
    });

    it('returns null when item not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await repo.updatePosition('nonexistent', 1, 1);
      expect(result).toBeNull();
    });
  });
});
