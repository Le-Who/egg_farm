/**
 * SoundManager — centralized audio control for Phaser scenes.
 * Listens for EventBridge events and plays corresponding sounds.
 */

import { EventBridge } from "../EventBridge";

export interface SoundConfig {
  key: string;
  volume?: number;
}

const SOUND_MAP: Record<string, SoundConfig> = {
  place_item: { key: "sfx_place", volume: 0.6 },
  remove_item: { key: "sfx_pop", volume: 0.5 },
  furniture_added: { key: "sfx_place", volume: 0.6 },
  buy_ok: { key: "sfx_coin", volume: 0.7 },
  harvest_complete: { key: "sfx_harvest", volume: 0.8 },
  pet_hatched: { key: "sfx_hatch", volume: 0.9 },
  server_error: { key: "sfx_error", volume: 0.4 },
};

let scene: Phaser.Scene | null = null;
let muted = false;

/**
 * Bind the SoundManager to a Phaser scene.
 * Must be called after scene.create() when audio is ready.
 */
export function initSoundManager(phaserScene: Phaser.Scene): void {
  scene = phaserScene;

  // Wire EventBridge events to sound effects
  for (const [event, config] of Object.entries(SOUND_MAP)) {
    EventBridge.on(event, () => playSound(config.key, config.volume));
  }
}

/**
 * Play a sound effect if audio is loaded and not muted.
 */
export function playSound(key: string, volume: number = 0.5): void {
  if (muted || !scene) return;

  try {
    if (scene.sound.get(key)) {
      scene.sound.play(key, { volume });
    }
  } catch {
    // Sound not loaded yet — silently skip
  }
}

/**
 * Toggle mute state.
 */
export function toggleMute(): boolean {
  muted = !muted;
  return muted;
}

export function isMuted(): boolean {
  return muted;
}
