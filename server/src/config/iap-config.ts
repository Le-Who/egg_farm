/**
 * In-App Purchase SKU configuration.
 * Per PROJECT.md §5.2 — 3 SKUs for MVP.
 * Prices are hardcoded server-side for anti-cheat.
 */

export interface SKUDefinition {
  skuId: string;
  name: string;
  description: string;
  /** Price in USD cents */
  priceUsdCents: number;
  /** Gems granted */
  gems: number;
  /** Bonus items included (starter pack etc.) */
  bonusItems?: { itemId: string; quantity: number }[];
}

export const SKUS: Record<string, SKUDefinition> = {
  "com.game.pouch_gems_small": {
    skuId: "com.game.pouch_gems_small",
    name: "Small Gem Pouch",
    description: "100 Gems",
    priceUsdCents: 99,
    gems: 100,
  },
  "com.game.pouch_gems_medium": {
    skuId: "com.game.pouch_gems_medium",
    name: "Medium Gem Pouch",
    description: "550 Gems — Best Value!",
    priceUsdCents: 499,
    gems: 550,
  },
  "com.game.starter_pack": {
    skuId: "com.game.starter_pack",
    name: "Starter Pack",
    description: "Pet Egg + 200 Gems",
    priceUsdCents: 299,
    gems: 200,
    bonusItems: [{ itemId: "egg_basic", quantity: 1 }],
  },
};

export function getSKU(skuId: string): SKUDefinition | undefined {
  return SKUS[skuId];
}

export function getAllSKUs(): SKUDefinition[] {
  return Object.values(SKUS);
}
