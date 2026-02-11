import { describe, it, expect } from 'vitest';
import { cartToIso, isoToCart, snapToGrid, isInBounds, TILE_WIDTH, TILE_HEIGHT } from '../../shared/grid';

describe('IsoGrid — cartToIso', () => {
  it('converts origin (0,0) to screen origin', () => {
    const result = cartToIso(0, 0);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('converts (1,0) correctly', () => {
    const result = cartToIso(1, 0);
    expect(result.x).toBe(TILE_WIDTH / 2);
    expect(result.y).toBe(TILE_HEIGHT / 2);
  });

  it('converts (0,1) correctly', () => {
    const result = cartToIso(0, 1);
    expect(result.x).toBe(-TILE_WIDTH / 2);
    expect(result.y).toBe(TILE_HEIGHT / 2);
  });

  it('converts (3,5) with correct formula', () => {
    const result = cartToIso(3, 5);
    expect(result.x).toBe((3 - 5) * TILE_WIDTH / 2);
    expect(result.y).toBe((3 + 5) * TILE_HEIGHT / 2);
  });
});

describe('IsoGrid — isoToCart', () => {
  it('is the inverse of cartToIso', () => {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const iso = cartToIso(x, y);
        const cart = isoToCart(iso.x, iso.y);
        expect(cart.x).toBeCloseTo(x, 5);
        expect(cart.y).toBeCloseTo(y, 5);
      }
    }
  });
});

describe('IsoGrid — snapToGrid', () => {
  it('snaps exact tile center to correct coords', () => {
    const iso = cartToIso(3, 4);
    const snapped = snapToGrid(iso.x, iso.y);
    expect(snapped.x).toBe(3);
    expect(snapped.y).toBe(4);
  });

  it('snaps near-miss to nearest tile', () => {
    const iso = cartToIso(3, 4);
    const snapped = snapToGrid(iso.x + 5, iso.y + 2);
    expect(snapped.x).toBe(3);
    expect(snapped.y).toBe(4);
  });
});

describe('IsoGrid — isInBounds', () => {
  it('returns true for valid coordinates', () => {
    expect(isInBounds(0, 0, 10, 10)).toBe(true);
    expect(isInBounds(9, 9, 10, 10)).toBe(true);
    expect(isInBounds(5, 5, 10, 10)).toBe(true);
  });

  it('returns false for negative coordinates', () => {
    expect(isInBounds(-1, 0, 10, 10)).toBe(false);
    expect(isInBounds(0, -1, 10, 10)).toBe(false);
  });

  it('returns false for out-of-range coordinates', () => {
    expect(isInBounds(10, 5, 10, 10)).toBe(false);
    expect(isInBounds(5, 10, 10, 10)).toBe(false);
  });
});
