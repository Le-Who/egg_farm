/**
 * Lightweight EventEmitter bridging React ↔ Phaser ↔ Network.
 * Decouples layers so each can be tested independently.
 */
class EventBridgeImpl {
    constructor() {
        this.listeners = new Map();
    }
    on(event, fn) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(fn);
    }
    off(event, fn) {
        this.listeners.get(event)?.delete(fn);
    }
    emit(event, ...args) {
        this.listeners.get(event)?.forEach((fn) => fn(...args));
    }
    /** Remove all listeners — useful for cleanup in tests */
    clear() {
        this.listeners.clear();
    }
}
export const EventBridge = new EventBridgeImpl();
