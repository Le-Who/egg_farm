import Phaser from "phaser";
import { cartToIso, snapToGrid, isInBounds, TILE_WIDTH, TILE_HEIGHT, } from "../grid/IsoGrid";
import { EventBridge } from "../../EventBridge";
const GRID_W = 10;
const GRID_H = 10;
// Offset so the grid is centered in the canvas
const ORIGIN_X = 400;
const ORIGIN_Y = 100;
// Item colors for MVP (no art assets yet)
const ITEM_COLORS = {
    chair_wood: 0x8b5e3c,
    table_wood: 0xa0522d,
    rug_red: 0xb22222,
    lamp_floor: 0xffd700,
    pot_flower: 0x228b22,
    seed_mint: 0x98fb98,
};
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.placedItems = new Map();
        this.placingItemId = null;
    }
    create() {
        this.drawGrid();
        this.createHighlight();
        this.setupPointerEvents();
        this.listenToBridge();
    }
    // ── Grid Rendering ───────────────────────────────────────────────
    drawGrid() {
        const graphics = this.add.graphics({
            lineStyle: { width: 1, color: 0x3a3a5c, alpha: 0.6 },
        });
        for (let gx = 0; gx < GRID_W; gx++) {
            for (let gy = 0; gy < GRID_H; gy++) {
                const iso = cartToIso(gx, gy);
                const sx = iso.x + ORIGIN_X;
                const sy = iso.y + ORIGIN_Y;
                // Draw diamond tile
                graphics.strokePoints([
                    new Phaser.Geom.Point(sx, sy - TILE_HEIGHT / 2),
                    new Phaser.Geom.Point(sx + TILE_WIDTH / 2, sy),
                    new Phaser.Geom.Point(sx, sy + TILE_HEIGHT / 2),
                    new Phaser.Geom.Point(sx - TILE_WIDTH / 2, sy),
                ], true);
            }
        }
    }
    // ── Highlight ────────────────────────────────────────────────────
    createHighlight() {
        this.highlight = this.add.polygon(0, 0, [
            0,
            -TILE_HEIGHT / 2,
            TILE_WIDTH / 2,
            0,
            0,
            TILE_HEIGHT / 2,
            -TILE_WIDTH / 2,
            0,
        ], 0x44aaff, 0.35);
        this.highlight.setOrigin(0, 0);
        this.highlight.setDepth(100);
        this.highlight.setVisible(false);
    }
    // ── Pointer Events ───────────────────────────────────────────────
    setupPointerEvents() {
        this.input.on("pointermove", (pointer) => {
            const worldX = pointer.worldX - ORIGIN_X;
            const worldY = pointer.worldY - ORIGIN_Y;
            const snapped = snapToGrid(worldX, worldY);
            if (isInBounds(snapped.x, snapped.y, GRID_W, GRID_H)) {
                const iso = cartToIso(snapped.x, snapped.y);
                this.highlight.setPosition(iso.x + ORIGIN_X, iso.y + ORIGIN_Y);
                this.highlight.setVisible(true);
            }
            else {
                this.highlight.setVisible(false);
            }
        });
        this.input.on("pointerdown", (pointer) => {
            if (!this.placingItemId)
                return;
            const worldX = pointer.worldX - ORIGIN_X;
            const worldY = pointer.worldY - ORIGIN_Y;
            const snapped = snapToGrid(worldX, worldY);
            if (isInBounds(snapped.x, snapped.y, GRID_W, GRID_H)) {
                // Send placement request to server via EventBridge
                EventBridge.emit("place_item", {
                    itemId: this.placingItemId,
                    gridX: snapped.x,
                    gridY: snapped.y,
                });
                this.placingItemId = null;
            }
        });
    }
    listenToBridge() {
        this.onStartPlacement = (itemId) => {
            this.placingItemId = itemId;
        };
        this.onFurnitureAdded = (data) => {
            this.addFurnitureSprite(data.id, data.itemId, data.gridX, data.gridY);
        };
        this.onFurnitureRemoved = (id) => {
            this.removeFurnitureSprite(id);
        };
        this.onFurnitureMoved = (data) => {
            this.moveFurnitureSprite(data.id, data.gridX, data.gridY);
        };
        this.onRoomJoined = () => {
            this.clearAllFurniture();
        };
        EventBridge.on("start_placement", this.onStartPlacement);
        EventBridge.on("furniture_added", this.onFurnitureAdded);
        EventBridge.on("furniture_removed", this.onFurnitureRemoved);
        EventBridge.on("furniture_moved", this.onFurnitureMoved);
        EventBridge.on("room_joined", this.onRoomJoined);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
    }
    shutdown() {
        if (this.onStartPlacement)
            EventBridge.off("start_placement", this.onStartPlacement);
        if (this.onFurnitureAdded)
            EventBridge.off("furniture_added", this.onFurnitureAdded);
        if (this.onFurnitureRemoved)
            EventBridge.off("furniture_removed", this.onFurnitureRemoved);
        if (this.onFurnitureMoved)
            EventBridge.off("furniture_moved", this.onFurnitureMoved);
        if (this.onRoomJoined)
            EventBridge.off("room_joined", this.onRoomJoined);
    }
    clearAllFurniture() {
        this.placedItems.forEach((placed) => placed.sprite.destroy());
        this.placedItems.clear();
    }
    // ── Furniture Sprites ────────────────────────────────────────────
    addFurnitureSprite(id, itemId, gridX, gridY) {
        const iso = cartToIso(gridX, gridY);
        const color = ITEM_COLORS[itemId] ?? 0x888888;
        const sprite = this.add.rectangle(iso.x + ORIGIN_X, iso.y + ORIGIN_Y - 8, // Offset up slightly to sit "on" tile
        TILE_WIDTH * 0.6, TILE_HEIGHT * 1.2, color);
        sprite.setDepth(gridX + gridY); // Simple depth sort
        this.placedItems.set(id, { sprite, itemId, gridX, gridY });
    }
    removeFurnitureSprite(id) {
        const placed = this.placedItems.get(id);
        if (placed) {
            placed.sprite.destroy();
            this.placedItems.delete(id);
        }
    }
    moveFurnitureSprite(id, gridX, gridY) {
        const placed = this.placedItems.get(id);
        if (placed) {
            const iso = cartToIso(gridX, gridY);
            placed.sprite.setPosition(iso.x + ORIGIN_X, iso.y + ORIGIN_Y - 8);
            placed.sprite.setDepth(gridX + gridY);
            placed.gridX = gridX;
            placed.gridY = gridY;
        }
    }
}
