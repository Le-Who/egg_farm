import type { ItemDefinition } from '../../../shared/types.js';

/**
 * Seed/Plant configuration — growth times and harvest rewards.
 * Growth times are in milliseconds for server authority.
 */
export interface PlantConfig {
  seedItemId: string;
  name: string;
  growthTimeMs: number;
  harvestYield: { itemId: string; quantity: number }[];
  /** Coins awarded on harvest */
  coinReward: number;
  /** XP awarded on harvest */
  xpReward: number;
}

export const PLANTS: Record<string, PlantConfig> = {
  seed_mint: {
    seedItemId: 'seed_mint',
    name: 'Mint',
    growthTimeMs: 60_000, // 1 minute for MVP testing
    harvestYield: [{ itemId: 'herb_mint', quantity: 2 }],
    coinReward: 25,
    xpReward: 10,
  },
  seed_tomato: {
    seedItemId: 'seed_tomato',
    name: 'Tomato',
    growthTimeMs: 120_000, // 2 minutes
    harvestYield: [{ itemId: 'fruit_tomato', quantity: 3 }],
    coinReward: 40,
    xpReward: 15,
  },
  seed_sunflower: {
    seedItemId: 'seed_sunflower',
    name: 'Sunflower',
    growthTimeMs: 180_000, // 3 minutes
    harvestYield: [{ itemId: 'flower_sunflower', quantity: 1 }],
    coinReward: 60,
    xpReward: 25,
  },
};

export function getPlantConfig(seedItemId: string): PlantConfig | undefined {
  return PLANTS[seedItemId];
}

export function getAllPlants(): PlantConfig[] {
  return Object.values(PLANTS);
}
