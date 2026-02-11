import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryRepo } from '../src/db/repositories/InventoryRepo';

function createMockPool() {
  return { query: vi.fn() } as any;
}

describe('InventoryRepo', () => {
  let pool: ReturnType<typeof createMockPool>;
  let repo: InventoryRepo;

  beforeEach(() => {
    pool = createMockPool();
    repo = new InventoryRepo(pool);
  });

  describe('getByUserId', () => {
    it('returns all items for a user', async () => {
      const items = [
        { userId: 'u1', itemId: 'seed_mint', quantity: 5 },
        { userId: 'u1', itemId: 'herb_mint', quantity: 10 },
      ];
      pool.query.mockResolvedValue({ rows: items });

      const result = await repo.getByUserId('u1');
      expect(result).toHaveLength(2);
      expect(result[0].itemId).toBe('seed_mint');
    });

    it('returns empty array when user has no items', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await repo.getByUserId('u-empty')).toEqual([]);
    });
  });

  describe('getItem', () => {
    it('returns specific item with quantity', async () => {
      pool.query.mockResolvedValue({
        rows: [{ userId: 'u1', itemId: 'seed_mint', quantity: 3 }],
      });

      const result = await repo.getItem('u1', 'seed_mint');
      expect(result).not.toBeNull();
      expect(result!.quantity).toBe(3);
    });

    it('returns null when item not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      expect(await repo.getItem('u1', 'nonexistent')).toBeNull();
    });
  });

  describe('addItem', () => {
    it('upserts item quantity', async () => {
      pool.query.mockResolvedValue({
        rows: [{ userId: 'u1', itemId: 'seed_mint', quantity: 8 }],
      });

      const result = await repo.addItem('u1', 'seed_mint', 3);
      expect(result.quantity).toBe(8);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        ['u1', 'seed_mint', 3],
      );
    });
  });

  describe('removeItem', () => {
    it('returns true when sufficient stock', async () => {
      pool.query.mockResolvedValue({ rows: [{ quantity: 2 }] });

      const result = await repo.removeItem('u1', 'seed_mint', 3);
      expect(result).toBe(true);
    });

    it('returns false when insufficient stock', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await repo.removeItem('u1', 'seed_mint', 100);
      expect(result).toBe(false);
    });

    it('deletes row when quantity reaches zero', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ quantity: 0 }] })
        .mockResolvedValueOnce({ rows: [] });

      await repo.removeItem('u1', 'seed_mint', 5);
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenLastCalledWith(
        expect.stringContaining('DELETE'),
        ['u1', 'seed_mint'],
      );
    });
  });
});
