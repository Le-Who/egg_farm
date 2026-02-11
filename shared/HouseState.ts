import { Schema, MapSchema, type } from '@colyseus/schema';

/** Represents one placed furniture item synced to all room clients */
export class FurnitureSchema extends Schema {
  @type('string') id: string = '';
  @type('string') itemId: string = '';
  @type('int32') gridX: number = 0;
  @type('int32') gridY: number = 0;
}

/** Represents a connected player */
export class PlayerSchema extends Schema {
  @type('string') odiscordId: string = '';
  @type('string') odisplayName: string = '';
}

/** The full room state — auto-synced by Colyseus to all clients */
export class HouseState extends Schema {
  @type('string') ownerId: string = '';

  @type({ map: FurnitureSchema })
  furniture = new MapSchema<FurnitureSchema>();

  @type({ map: PlayerSchema })
  players = new MapSchema<PlayerSchema>();
}
