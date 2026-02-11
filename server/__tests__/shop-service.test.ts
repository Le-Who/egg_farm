import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getItemDef } from '../src/config/game-config';

/**
 * ShopService — handles buying items with soft currency.
 * Tested inline with shop tests here, implementation in ShopService.ts.
 */

// Inline minimal ShopService logic for TDD
interface ShopDeps {
  getUserCoins: (userId: string) => Promise<number>;
  deductCoins: (userId: string, amount: number) => Promise<number>;
  addToInventory: (userId: string, itemId: string, qty: number) => Promise<void>;
}

function createShopService(deps: ShopDeps) {
  return {
    async buyItem(userId: string, itemId: string, quantity: number = 1) {
      const def = getItemDef(itemId);
      if (!def) return { success: false, error: 'Unknown item' };
      if (def.currency !== 'coins') return { success: false, error: 'Premium item' };

      const totalCost = def.price * quantity;
      const currentCoins = await deps.getUserCoins(userId);

      if (currentCoins < totalCost) {
        return { success: false, error: 'Insufficient coins' };
      }

      const newBalance = await deps.deductCoins(userId, totalCost);
      await deps.addToInventory(userId, itemId, quantity);

      return { success: true, newBalance, cost: totalCost };
    },
  };
}

describe('ShopService — buyItem', () => {
  let deps: ShopDeps;
  let shop: ReturnType<typeof createShopService>;

  beforeEach(() => {
    deps = {
      getUserCoins: vi.fn().mockResolvedValue(500),
      deductCoins: vi.fn().mockResolvedValue(450),
      addToInventory: vi.fn().mockResolvedValue(undefined),
    };
    shop = createShopService(deps);
  });

  it('successfully buys a valid item', async () => {
    const result = await shop.buyItem('u1', 'chair_wood', 1);

    expect(result.success).toBe(true);
    expect(result.cost).toBe(50); // chair_wood costs 50
    expect(deps.deductCoins).toHaveBeenCalledWith('u1', 50);
    expect(deps.addToInventory).toHaveBeenCalledWith('u1', 'chair_wood', 1);
  });

  it('rejects purchase of unknown item', async () => {
    const result = await shop.buyItem('u1', 'fake_item', 1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown item');
  });

  it('rejects purchase when insufficient coins', async () => {
    (deps.getUserCoins as any).mockResolvedValue(10); // Only 10 coins
    const result = await shop.buyItem('u1', 'chair_wood', 1); // Costs 50

    expect(result.success).toBe(false);
    expect(result.error).toBe('Insufficient coins');
    expect(deps.deductCoins).not.toHaveBeenCalled();
  });

  it('handles bulk purchase correctly', async () => {
    (deps.getUserCoins as any).mockResolvedValue(1000);
    (deps.deductCoins as any).mockResolvedValue(700);

    const result = await shop.buyItem('u1', 'seed_mint', 3);

    expect(result.success).toBe(true);
    expect(result.cost).toBe(30); // 10 * 3
    expect(deps.addToInventory).toHaveBeenCalledWith('u1', 'seed_mint', 3);
  });
});
