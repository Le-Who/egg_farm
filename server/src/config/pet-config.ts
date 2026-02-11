/**
 * Pet type configuration — defines all hatchable pets, their bonuses, and rarity.
 * Per PROJECT.md §3.2: Incubator uses gacha mechanics with weighted rarity.
 */

export interface PetTypeConfig {
  petType: string;
  name: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  /** Weight for gacha drop — higher = more common */
  weight: number;
  /** Hatch duration in milliseconds */
  hatchTimeMs: number;
  /** Growth speed modifier — multiplied into plant growthTimeMs (lower = faster) */
  growthSpeedMod: number;
  /** Hunger decay per hour */
  hungerDecayPerHour: number;
}

export const PET_TYPES: Record<string, PetTypeConfig> = {
  slime_grass: {
    petType: "slime_grass",
    name: "Grass Slime",
    rarity: "common",
    weight: 50,
    hatchTimeMs: 60_000, // 1 min for MVP
    growthSpeedMod: 0.9, // 10% faster growth
    hungerDecayPerHour: 10,
  },
  bunny_snow: {
    petType: "bunny_snow",
    name: "Snow Bunny",
    rarity: "common",
    weight: 40,
    hatchTimeMs: 60_000,
    growthSpeedMod: 0.85, // 15% faster
    hungerDecayPerHour: 12,
  },
  fox_ember: {
    petType: "fox_ember",
    name: "Ember Fox",
    rarity: "uncommon",
    weight: 20,
    hatchTimeMs: 120_000, // 2 min
    growthSpeedMod: 0.75, // 25% faster
    hungerDecayPerHour: 8,
  },
  dragon_fire: {
    petType: "dragon_fire",
    name: "Fire Dragon",
    rarity: "rare",
    weight: 8,
    hatchTimeMs: 180_000, // 3 min
    growthSpeedMod: 0.6, // 40% faster
    hungerDecayPerHour: 15,
  },
  phoenix_gold: {
    petType: "phoenix_gold",
    name: "Golden Phoenix",
    rarity: "legendary",
    weight: 2,
    hatchTimeMs: 300_000, // 5 min
    growthSpeedMod: 0.5, // 50% faster!
    hungerDecayPerHour: 5,
  },
};

export function getPetTypeConfig(petType: string): PetTypeConfig | undefined {
  return PET_TYPES[petType];
}

export function getAllPetTypes(): PetTypeConfig[] {
  return Object.values(PET_TYPES);
}

/**
 * Gacha roll — weighted random selection of a pet type.
 * Uses cumulative weight algorithm.
 */
export function rollGacha(rand: number = Math.random()): PetTypeConfig {
  const all = getAllPetTypes();
  const totalWeight = all.reduce((sum, p) => sum + p.weight, 0);
  let cumulative = 0;

  for (const pet of all) {
    cumulative += pet.weight / totalWeight;
    if (rand <= cumulative) return pet;
  }

  // Fallback (should never reach)
  return all[all.length - 1];
}
