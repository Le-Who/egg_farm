import { describe, it, expect } from 'vitest';
import { cartToIso, isoToCart, snapToGrid, isInBounds, TILE_WIDTH, TILE_HEIGHT } from '../../shared/grid';

describe('IsoGrid (shared math)', () => {
  it('cartToIso produces correct coordinates', () => {
    expect(cartToIso(0, 0)).toEqual({ x: 0, y: 0 });
    expect(cartToIso(1, 0)).toEqual({ x: TILE_WIDTH / 2, y: TILE_HEIGHT / 2 });
    expect(cartToIso(0, 1)).toEqual({ x: -TILE_WIDTH / 2, y: TILE_HEIGHT / 2 });
  });

  it('round-trip conversion is lossless', () => {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const iso = cartToIso(x, y);
        const cart = isoToCart(iso.x, iso.y);
        expect(cart.x).toBeCloseTo(x, 5);
        expect(cart.y).toBeCloseTo(y, 5);
      }
    }
  });

  it('snapToGrid snaps exact and near-miss coords', () => {
    const iso = cartToIso(5, 7);
    expect(snapToGrid(iso.x, iso.y)).toEqual({ x: 5, y: 7 });
    expect(snapToGrid(iso.x + 3, iso.y + 1)).toEqual({ x: 5, y: 7 });
  });

  it('isInBounds validates correctly', () => {
    expect(isInBounds(0, 0, 10, 10)).toBe(true);
    expect(isInBounds(9, 9, 10, 10)).toBe(true);
    expect(isInBounds(-1, 0, 10, 10)).toBe(false);
    expect(isInBounds(10, 0, 10, 10)).toBe(false);
  });
});
