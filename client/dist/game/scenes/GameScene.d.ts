import Phaser from "phaser";
export declare class GameScene extends Phaser.Scene {
    private highlight;
    private placedItems;
    private placingItemId;
    constructor();
    create(): void;
    private drawGrid;
    private createHighlight;
    private setupPointerEvents;
    private onFurnitureAdded;
    private onFurnitureRemoved;
    private onFurnitureMoved;
    private onStartPlacement;
    private onRoomJoined;
    private listenToBridge;
    private shutdown;
    private clearAllFurniture;
    addFurnitureSprite(id: string, itemId: string, gridX: number, gridY: number): void;
    removeFurnitureSprite(id: string): void;
    moveFurnitureSprite(id: string, gridX: number, gridY: number): void;
}
