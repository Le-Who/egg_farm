import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
/**
 * Create and return a Phaser.Game instance.
 * Mounts into the given parent DOM element.
 */
export function createPhaserGame(parent) {
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent,
        backgroundColor: '#16213e',
        scene: [GameScene],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        // Disable Phaser's default right-click handling
        input: {
            mouse: { preventDefaultDown: false },
        },
    };
    return new Phaser.Game(config);
}
