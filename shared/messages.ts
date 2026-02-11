// Message type constants for Colyseus client ↔ server communication

export const MSG = {
  PLACE_ITEM: 'PLACE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  MOVE_ITEM: 'MOVE_ITEM',
  HARVEST: 'HARVEST',
} as const;

export type MessageType = typeof MSG[keyof typeof MSG];

// Payload shapes for each message type
export interface PlaceItemPayload {
  itemId: string;
  gridX: number;
  gridY: number;
}

export interface RemoveItemPayload {
  /** ID of the placed house_item record */
  houseItemId: string;
}

export interface MoveItemPayload {
  houseItemId: string;
  gridX: number;
  gridY: number;
}

export interface HarvestPayload {
  houseItemId: string;
}
