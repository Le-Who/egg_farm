import { describe, it, expect } from 'vitest';
import { checkGrowth, validateHarvest } from '../src/services/PlantingService';
import { PLANTS } from '../src/config/plant-config';

describe('PlantingService — checkGrowth', () => {
  const MINT_GROWTH = PLANTS.seed_mint.growthTimeMs; // 60_000ms

  it('returns "growing" when seed was just planted', () => {
    const plantedAt = 1000;
    const now = 1000 + 10_000; // 10s elapsed of 60s growth

    const status = checkGrowth(plantedAt, 'seed_mint', now);

    expect(status).not.toBeNull();
    expect(status!.stage).toBe('growing');
    expect(status!.progress).toBeCloseTo(10_000 / MINT_GROWTH, 5);
    expect(status!.remainingMs).toBe(MINT_GROWTH - 10_000);
  });

  it('returns "ready" when growth time has elapsed', () => {
    const plantedAt = 1000;
    const now = 1000 + MINT_GROWTH; // Exactly at growth time

    const status = checkGrowth(plantedAt, 'seed_mint', now);

    expect(status!.stage).toBe('ready');
    expect(status!.progress).toBe(1);
    expect(status!.remainingMs).toBe(0);
  });

  it('returns "ready" when past growth time (overripe slot still occupied)', () => {
    const plantedAt = 1000;
    const now = 1000 + MINT_GROWTH + 60_000; // Way past ready

    const status = checkGrowth(plantedAt, 'seed_mint', now);

    expect(status!.stage).toBe('ready');
    expect(status!.progress).toBe(1);
  });

  it('returns null for unknown seed type', () => {
    const status = checkGrowth(1000, 'seed_unknown', 2000);
    expect(status).toBeNull();
  });

  it('applies speed modifier correctly', () => {
    const plantedAt = 1000;
    const halfSpeedMod = 0.5; // 2x faster
    const effectiveGrowth = MINT_GROWTH * halfSpeedMod; // 30_000ms
    const now = plantedAt + effectiveGrowth;

    const status = checkGrowth(plantedAt, 'seed_mint', now, halfSpeedMod);

    expect(status!.stage).toBe('ready');
    expect(status!.remainingMs).toBe(0);
  });

  it('shows correct progress at 50%', () => {
    const plantedAt = 0;
    const now = MINT_GROWTH / 2; // Halfway

    const status = checkGrowth(plantedAt, 'seed_mint', now);

    expect(status!.stage).toBe('growing');
    expect(status!.progress).toBeCloseTo(0.5, 5);
  });
});

describe('PlantingService — validateHarvest', () => {
  const MINT_GROWTH = PLANTS.seed_mint.growthTimeMs;

  it('returns plant config when growth is complete', () => {
    const plantedAt = 0;
    const now = MINT_GROWTH + 1;

    const result = validateHarvest(plantedAt, 'seed_mint', now);

    expect(result).not.toBeNull();
    expect(result!.seedItemId).toBe('seed_mint');
    expect(result!.coinReward).toBe(25);
    expect(result!.harvestYield[0].itemId).toBe('herb_mint');
  });

  it('returns null when plant is still growing', () => {
    const plantedAt = 0;
    const now = MINT_GROWTH - 1; // 1ms too early

    const result = validateHarvest(plantedAt, 'seed_mint', now);
    expect(result).toBeNull();
  });

  it('returns null for unknown seed', () => {
    const result = validateHarvest(0, 'seed_fake', 999999);
    expect(result).toBeNull();
  });

  it('respects speed modifier for harvest validation', () => {
    const plantedAt = 0;
    const doubleSlow = 2.0; // 2x slower
    const effectiveGrowth = MINT_GROWTH * doubleSlow;

    // At normal growth time — still growing with 2x modifier
    expect(validateHarvest(plantedAt, 'seed_mint', MINT_GROWTH, doubleSlow)).toBeNull();

    // At double growth time — ready
    expect(validateHarvest(plantedAt, 'seed_mint', effectiveGrowth + 1, doubleSlow)).not.toBeNull();
  });
});

describe('plant-config', () => {
  it('all plants have valid required fields', () => {
    Object.values(PLANTS).forEach((plant) => {
      expect(plant.seedItemId).toBeTruthy();
      expect(plant.name).toBeTruthy();
      expect(plant.growthTimeMs).toBeGreaterThan(0);
      expect(plant.harvestYield.length).toBeGreaterThan(0);
      expect(plant.coinReward).toBeGreaterThanOrEqual(0);
      expect(plant.xpReward).toBeGreaterThanOrEqual(0);
    });
  });
});
