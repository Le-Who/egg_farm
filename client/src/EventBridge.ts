/**
 * Lightweight EventEmitter bridging React ↔ Phaser ↔ Network.
 * Decouples layers so each can be tested independently.
 */

type Listener = (...args: any[]) => void;

class EventBridgeImpl {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, fn: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
  }

  off(event: string, fn: Listener): void {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }

  /** Remove all listeners — useful for cleanup in tests */
  clear(): void {
    this.listeners.clear();
  }
}

export const EventBridge = new EventBridgeImpl();
