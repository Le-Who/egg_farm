import { describe, it, expect } from "vitest";
import {
  checkHatch,
  openEgg,
  calculateHunger,
} from "../src/services/IncubationService";
import { PET_TYPES, rollGacha } from "../src/config/pet-config";

describe("IncubationService — checkHatch", () => {
  const SLIME_HATCH = PET_TYPES.slime_grass.hatchTimeMs; // 60_000ms

  it('returns "incubating" when freshly placed', () => {
    const status = checkHatch(1000, "slime_grass", 1000 + 10_000);

    expect(status!.stage).toBe("incubating");
    expect(status!.progress).toBeCloseTo(10_000 / SLIME_HATCH, 5);
    expect(status!.remainingMs).toBe(SLIME_HATCH - 10_000);
  });

  it('returns "ready" when hatch time has elapsed', () => {
    const status = checkHatch(1000, "slime_grass", 1000 + SLIME_HATCH);

    expect(status!.stage).toBe("ready");
    expect(status!.progress).toBe(1);
    expect(status!.remainingMs).toBe(0);
  });

  it('returns "ready" when past hatch time', () => {
    const status = checkHatch(1000, "slime_grass", 1000 + SLIME_HATCH + 99999);
    expect(status!.stage).toBe("ready");
  });

  it("returns null for unknown pet type", () => {
    expect(checkHatch(1000, "unknown_pet", 2000)).toBeNull();
  });

  it("shows 50% progress at half time", () => {
    const status = checkHatch(0, "slime_grass", SLIME_HATCH / 2);

    expect(status!.stage).toBe("incubating");
    expect(status!.progress).toBeCloseTo(0.5, 5);
  });
});

describe("IncubationService — openEgg (gacha)", () => {
  it("returns a common pet for high rand (low roll)", () => {
    // rand = 0.01 should hit the first common pet
    const pet = openEgg(0.01);
    expect(pet.rarity).toBe("common");
  });

  it("returns a legendary pet for rand near 1.0", () => {
    // rand = 0.999 should hit the last (legendary) pet in cumulative weights
    const pet = openEgg(0.999);
    expect(pet.rarity).toBe("legendary");
  });

  it("always returns a valid pet config", () => {
    for (let i = 0; i < 100; i++) {
      const pet = openEgg(Math.random());
      expect(pet.petType).toBeTruthy();
      expect(pet.name).toBeTruthy();
    }
  });
});

describe("IncubationService — calculateHunger", () => {
  it("decays hunger over time", () => {
    // slime_grass: 10 hunger/hour
    const oneHourMs = 60 * 60 * 1000;
    const result = calculateHunger(100, "slime_grass", oneHourMs);
    expect(result).toBe(90);
  });

  it("does not go below 0", () => {
    const twentyHoursMs = 20 * 60 * 60 * 1000;
    const result = calculateHunger(100, "slime_grass", twentyHoursMs);
    expect(result).toBe(0);
  });

  it("returns current hunger for unknown pet", () => {
    expect(calculateHunger(80, "fake_pet", 999999)).toBe(80);
  });

  it("calculates partial hours correctly", () => {
    const thirtyMinMs = 30 * 60 * 1000;
    const result = calculateHunger(100, "slime_grass", thirtyMinMs); // 5 hunger
    expect(result).toBe(95);
  });
});

describe("pet-config — rollGacha", () => {
  it("respects weight distribution", () => {
    const counts: Record<string, number> = {};
    const runs = 10000;

    for (let i = 0; i < runs; i++) {
      const pet = rollGacha();
      counts[pet.rarity] = (counts[pet.rarity] || 0) + 1;
    }

    // Common should be most frequent (weight 50+40=90)
    // Legendary should be rarest (weight 2)
    expect(counts["common"]).toBeGreaterThan(counts["rare"]!);
    expect(counts["rare"]!).toBeGreaterThan(counts["legendary"]!);
  });

  it("all pet types have required fields", () => {
    Object.values(PET_TYPES).forEach((pet) => {
      expect(pet.petType).toBeTruthy();
      expect(pet.name).toBeTruthy();
      expect(pet.hatchTimeMs).toBeGreaterThan(0);
      expect(pet.weight).toBeGreaterThan(0);
      expect(pet.growthSpeedMod).toBeGreaterThan(0);
      expect(pet.growthSpeedMod).toBeLessThanOrEqual(1);
    });
  });
});
