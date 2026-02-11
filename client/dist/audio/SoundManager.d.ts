/**
 * SoundManager — centralized audio control for Phaser scenes.
 * Listens for EventBridge events and plays corresponding sounds.
 */
export interface SoundConfig {
    key: string;
    volume?: number;
}
/**
 * Bind the SoundManager to a Phaser scene.
 * Must be called after scene.create() when audio is ready.
 */
export declare function initSoundManager(phaserScene: Phaser.Scene): void;
/**
 * Play a sound effect if audio is loaded and not muted.
 */
export declare function playSound(key: string, volume?: number): void;
/**
 * Toggle mute state.
 */
export declare function toggleMute(): boolean;
export declare function isMuted(): boolean;
