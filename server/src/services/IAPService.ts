import { getSKU } from "../config/iap-config.js";
import type { SKUDefinition } from "../config/iap-config.js";
import type { UserRepo } from "../db/repositories/UserRepo.js";
import type { InventoryRepo } from "../db/repositories/InventoryRepo.js";

export interface IAPResult {
  success: boolean;
  error?: string;
  gemsGranted?: number;
  newGemBalance?: number;
}

/**
 * IAP Service — validates SKU purchases and grants rewards.
 * In production, Discord's entitlement API would be called to verify
 * the payment before granting. For MVP, we trust the client's purchase token.
 */
export class IAPService {
  constructor(
    private userRepo: UserRepo,
    private inventoryRepo: InventoryRepo,
  ) {}

  async fulfillPurchase(
    userId: string,
    skuId: string,
    _purchaseToken?: string, // Placeholder for Discord IAP verification
  ): Promise<IAPResult> {
    const sku = getSKU(skuId);
    if (!sku) {
      return { success: false, error: `Unknown SKU: ${skuId}` };
    }

    // In production: verify purchase token with Discord API here
    // For MVP, we skip verification and just grant the rewards

    // Grant gems
    const user = await this.userRepo.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    await this.userRepo.updateGems(userId, sku.gems);

    // Grant bonus items (e.g. starter pack egg)
    if (sku.bonusItems) {
      for (const bonus of sku.bonusItems) {
        await this.inventoryRepo.addItem(userId, bonus.itemId, bonus.quantity);
      }
    }

    return {
      success: true,
      gemsGranted: sku.gems,
      newGemBalance: user.gems + sku.gems,
    };
  }
}
