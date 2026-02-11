/**
 * Isometric grid math — pure functions, fully testable.
 * Lives in shared/ so both client and server use identical logic.
 *
 * Uses the standard 2:1 isometric projection:
 *   isoX = (cartX - cartY) * tileWidth / 2
 *   isoY = (cartX + cartY) * tileHeight / 2
 */
export declare const TILE_WIDTH = 64;
export declare const TILE_HEIGHT = 32;
export interface IsoPoint {
    x: number;
    y: number;
}
/** Convert Cartesian grid coords to isometric screen coords */
export declare function cartToIso(cartX: number, cartY: number): IsoPoint;
/** Convert isometric screen coords back to Cartesian grid coords */
export declare function isoToCart(isoX: number, isoY: number): IsoPoint;
/** Snap world coordinates to the nearest grid-aligned tile index */
export declare function snapToGrid(worldX: number, worldY: number): IsoPoint;
/** Check whether a grid coordinate is within bounds */
export declare function isInBounds(gridX: number, gridY: number, width: number, height: number): boolean;
//# sourceMappingURL=grid.d.ts.map