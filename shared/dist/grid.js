/**
 * Isometric grid math — pure functions, fully testable.
 * Lives in shared/ so both client and server use identical logic.
 *
 * Uses the standard 2:1 isometric projection:
 *   isoX = (cartX - cartY) * tileWidth / 2
 *   isoY = (cartX + cartY) * tileHeight / 2
 */
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
/** Convert Cartesian grid coords to isometric screen coords */
export function cartToIso(cartX, cartY) {
    return {
        x: (cartX - cartY) * (TILE_WIDTH / 2),
        y: (cartX + cartY) * (TILE_HEIGHT / 2),
    };
}
/** Convert isometric screen coords back to Cartesian grid coords */
export function isoToCart(isoX, isoY) {
    return {
        x: (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2,
        y: (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2,
    };
}
/** Snap world coordinates to the nearest grid-aligned tile index */
export function snapToGrid(worldX, worldY) {
    const cart = isoToCart(worldX, worldY);
    return {
        x: Math.round(cart.x),
        y: Math.round(cart.y),
    };
}
/** Check whether a grid coordinate is within bounds */
export function isInBounds(gridX, gridY, width, height) {
    return gridX >= 0 && gridX < width && gridY >= 0 && gridY < height;
}
