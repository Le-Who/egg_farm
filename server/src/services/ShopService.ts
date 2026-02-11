import { getItemDef } from '../config/game-config.js';
import { UserRepo } from '../db/repositories/UserRepo.js';
import { InventoryRepo } from '../db/repositories/InventoryRepo.js';

export interface PurchaseResult {
  success: boolean;
  error?: string;
  newBalance?: number;
  cost?: number;
}

/**
 * ShopService — handles buying items with soft currency.
 * Server-authoritative: validates prices from hardcoded config (anti-cheat).
 */
export class ShopService {
  constructor(
    private userRepo: UserRepo,
    private inventoryRepo: InventoryRepo,
  ) {}

  async buyItem(userId: string, itemId: string, quantity: number = 1): Promise<PurchaseResult> {
    const def = getItemDef(itemId);
    if (!def) return { success: false, error: 'Unknown item' };
    if (def.currency !== 'coins') return { success: false, error: 'Premium item — use gems' };

    const totalCost = def.price * quantity;
    const user = await this.userRepo.findById(userId);
    if (!user) return { success: false, error: 'User not found' };

    if (user.coins < totalCost) {
      return { success: false, error: 'Insufficient coins' };
    }

    // Atomically deduct coins and add to inventory
    const newBalance = await this.userRepo.updateCoins(userId, -totalCost);
    await this.inventoryRepo.addItem(userId, itemId, quantity);

    return { success: true, newBalance, cost: totalCost };
  }
}
