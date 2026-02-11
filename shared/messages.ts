// Message type constants for Colyseus client ↔ server communication

export const MSG = {
  PLACE_ITEM: "PLACE_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  MOVE_ITEM: "MOVE_ITEM",
  PLANT_SEED: "PLANT_SEED",
  HARVEST: "HARVEST",
  BUY_ITEM: "BUY_ITEM",
  HATCH_EGG: "HATCH_EGG",
  SET_ACTIVE_PET: "SET_ACTIVE_PET",
} as const;

export type MessageType = (typeof MSG)[keyof typeof MSG];

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

export interface PlantSeedPayload {
  seedItemId: string;
  gridX: number;
  gridY: number;
}

export interface HarvestPayload {
  houseItemId: string;
}

export interface BuyItemPayload {
  itemId: string;
  quantity: number;
}

export interface HatchEggPayload {
  /** Grid coordinates of the incubator tile */
  gridX: number;
  gridY: number;
}

export interface SetActivePetPayload {
  petId: string;
}
