import { Schema, MapSchema } from '@colyseus/schema';
/** Represents one placed furniture item synced to all room clients */
export declare class FurnitureSchema extends Schema {
    id: string;
    itemId: string;
    gridX: number;
    gridY: number;
}
/** Represents a connected player */
export declare class PlayerSchema extends Schema {
    odiscordId: string;
    odisplayName: string;
}
/** The full room state — auto-synced by Colyseus to all clients */
export declare class HouseState extends Schema {
    ownerId: string;
    furniture: MapSchema<FurnitureSchema, string>;
    players: MapSchema<PlayerSchema, string>;
}
//# sourceMappingURL=HouseState.d.ts.map