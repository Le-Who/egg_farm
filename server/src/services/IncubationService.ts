import { getPetTypeConfig, rollGacha } from "../config/pet-config.js";
import type { PetTypeConfig } from "../config/pet-config.js";

/**
 * Incubation status — derived from timestamps (no setTimeout).
 * Per PROJECT.md §3.2: hatch_start + hatch_duration comparison.
 */
export type HatchStage = "incubating" | "ready";

export interface HatchStatus {
  stage: HatchStage;
  progress: number;
  remainingMs: number;
}

/**
 * Check incubation progress — pure timestamp comparison.
 */
export function checkHatch(
  hatchStart: number,
  petType: string,
  now: number = Date.now(),
): HatchStatus | null {
  const config = getPetTypeConfig(petType);
  if (!config) return null;

  const readyTime = hatchStart + config.hatchTimeMs;
  const elapsed = now - hatchStart;

  if (now >= readyTime) {
    return { stage: "ready", progress: 1, remainingMs: 0 };
  }

  return {
    stage: "incubating",
    progress: Math.min(elapsed / config.hatchTimeMs, 1),
    remainingMs: readyTime - now,
  };
}

/**
 * Open an egg — gacha roll to determine pet type.
 * Returns the pet type config for the rolled pet.
 */
export function openEgg(rand?: number): PetTypeConfig {
  return rollGacha(rand);
}

/**
 * Calculate hunger decay for a pet based on time elapsed.
 */
export function calculateHunger(
  currentHunger: number,
  petType: string,
  elapsedMs: number,
): number {
  const config = getPetTypeConfig(petType);
  if (!config) return currentHunger;

  const hoursElapsed = elapsedMs / (1000 * 60 * 60);
  const decay = config.hungerDecayPerHour * hoursElapsed;
  return Math.max(0, Math.round(currentHunger - decay));
}
