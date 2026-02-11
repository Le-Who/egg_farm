export declare const MSG: {
    readonly PLACE_ITEM: "PLACE_ITEM";
    readonly REMOVE_ITEM: "REMOVE_ITEM";
    readonly MOVE_ITEM: "MOVE_ITEM";
    readonly PLANT_SEED: "PLANT_SEED";
    readonly HARVEST: "HARVEST";
    readonly BUY_ITEM: "BUY_ITEM";
    readonly HATCH_EGG: "HATCH_EGG";
    readonly SET_ACTIVE_PET: "SET_ACTIVE_PET";
    readonly PURCHASE_GEMS: "PURCHASE_GEMS";
};
export type MessageType = (typeof MSG)[keyof typeof MSG];
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
export interface PurchaseGemsPayload {
    skuId: string;
    /** Discord purchase token for verification (stub for MVP) */
    purchaseToken?: string;
}
//# sourceMappingURL=messages.d.ts.map