/**
 * Lightweight EventEmitter bridging React ↔ Phaser ↔ Network.
 * Decouples layers so each can be tested independently.
 */
type Listener = (...args: any[]) => void;
declare class EventBridgeImpl {
    private listeners;
    on(event: string, fn: Listener): void;
    off(event: string, fn: Listener): void;
    emit(event: string, ...args: any[]): void;
    /** Remove all listeners — useful for cleanup in tests */
    clear(): void;
}
export declare const EventBridge: EventBridgeImpl;
export {};
