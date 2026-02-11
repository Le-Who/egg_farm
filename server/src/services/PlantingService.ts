import { getPlantConfig } from '../config/plant-config.js';
import type { PlantConfig } from '../config/plant-config.js';

/**
 * Growth stage of a planted seed — derived from timestamps, never stored.
 * Per PROJECT.md §3.1: no setTimeout, use timestamp comparison.
 */
export type GrowthStage = 'growing' | 'ready' | 'overripe';

export interface GrowthStatus {
  stage: GrowthStage;
  /** Progress from 0 to 1 (1 = fully grown) */
  progress: number;
  /** Milliseconds remaining until ready (0 if already ready) */
  remainingMs: number;
}

/**
 * Check the growth status of a planted seed.
 * Pure function — all logic from PROJECT.md §3.1.
 *
 * @param plantedAt - Timestamp when seed was planted (ms since epoch)
 * @param seedItemId - The seed type ID
 * @param now - Current timestamp (injectable for testing)
 * @param speedModifier - Multiplier from pet bonuses (1.0 = no bonus)
 */
export function checkGrowth(
  plantedAt: number,
  seedItemId: string,
  now: number = Date.now(),
  speedModifier: number = 1.0,
): GrowthStatus | null {
  const config = getPlantConfig(seedItemId);
  if (!config) return null;

  const effectiveGrowthTime = config.growthTimeMs * speedModifier;
  const elapsed = now - plantedAt;
  const readyTime = plantedAt + effectiveGrowthTime;

  if (now >= readyTime) {
    return {
      stage: 'ready',
      progress: 1,
      remainingMs: 0,
    };
  }

  return {
    stage: 'growing',
    progress: Math.min(elapsed / effectiveGrowthTime, 1),
    remainingMs: readyTime - now,
  };
}

/**
 * Validate a harvest attempt — server-authoritative per PROJECT.md §3.1.
 * Returns the plant config if harvest is valid, null otherwise.
 */
export function validateHarvest(
  plantedAt: number,
  seedItemId: string,
  now: number = Date.now(),
  speedModifier: number = 1.0,
): PlantConfig | null {
  const status = checkGrowth(plantedAt, seedItemId, now, speedModifier);
  if (!status) return null;

  if (status.stage === 'ready') {
    return getPlantConfig(seedItemId) ?? null;
  }

  return null; // Not ready yet
}
