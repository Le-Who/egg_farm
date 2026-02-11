var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Schema, MapSchema, type } from '@colyseus/schema';
/** Represents one placed furniture item synced to all room clients */
export class FurnitureSchema extends Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.itemId = '';
        this.gridX = 0;
        this.gridY = 0;
    }
}
__decorate([
    type('string')
], FurnitureSchema.prototype, "id", void 0);
__decorate([
    type('string')
], FurnitureSchema.prototype, "itemId", void 0);
__decorate([
    type('int32')
], FurnitureSchema.prototype, "gridX", void 0);
__decorate([
    type('int32')
], FurnitureSchema.prototype, "gridY", void 0);
/** Represents a connected player */
export class PlayerSchema extends Schema {
    constructor() {
        super(...arguments);
        this.odiscordId = '';
        this.odisplayName = '';
    }
}
__decorate([
    type('string')
], PlayerSchema.prototype, "odiscordId", void 0);
__decorate([
    type('string')
], PlayerSchema.prototype, "odisplayName", void 0);
/** The full room state — auto-synced by Colyseus to all clients */
export class HouseState extends Schema {
    constructor() {
        super(...arguments);
        this.ownerId = '';
        this.furniture = new MapSchema();
        this.players = new MapSchema();
    }
}
__decorate([
    type('string')
], HouseState.prototype, "ownerId", void 0);
__decorate([
    type({ map: FurnitureSchema })
], HouseState.prototype, "furniture", void 0);
__decorate([
    type({ map: PlayerSchema })
], HouseState.prototype, "players", void 0);
