import type { ItemDefinition } from "../../../shared/types.js";

/**
 * Hardcoded item catalog — authoritative source for prices and sizes.
 * Client gets a copy for UI display, but server always validates against this.
 */
export const ITEMS: Record<string, ItemDefinition> = {
  chair_wood: {
    id: "chair_wood",
    name: "Wooden Chair",
    category: "furniture",
    price: 50,
    currency: "coins",
    sizeX: 1,
    sizeY: 1,
  },
  table_wood: {
    id: "table_wood",
    name: "Wooden Table",
    category: "furniture",
    price: 100,
    currency: "coins",
    sizeX: 2,
    sizeY: 1,
  },
  rug_red: {
    id: "rug_red",
    name: "Red Rug",
    category: "decoration",
    price: 75,
    currency: "coins",
    sizeX: 2,
    sizeY: 2,
  },
  lamp_floor: {
    id: "lamp_floor",
    name: "Floor Lamp",
    category: "decoration",
    price: 60,
    currency: "coins",
    sizeX: 1,
    sizeY: 1,
  },
  pot_flower: {
    id: "pot_flower",
    name: "Flower Pot",
    category: "decoration",
    price: 30,
    currency: "coins",
    sizeX: 1,
    sizeY: 1,
  },
  seed_mint: {
    id: "seed_mint",
    name: "Mint Seeds",
    category: "seed",
    price: 10,
    currency: "coins",
    sizeX: 1,
    sizeY: 1,
  },
  seed_tomato: {
    id: "seed_tomato",
    name: "Tomato Seeds",
    category: "seed",
    price: 20,
    currency: "coins",
    sizeX: 1,
    sizeY: 1,
  },
  seed_sunflower: {
    id: "seed_sunflower",
    name: "Sunflower Seeds",
    category: "seed",
    price: 35,
    currency: "coins",
    sizeX: 1,
    sizeY: 1,
  },
  egg_basic: {
    id: "egg_basic",
    name: "Mystery Egg",
    category: "special",
    price: 100,
    currency: "coins",
    sizeX: 1,
    sizeY: 1,
  },
};

export function getItemDef(itemId: string): ItemDefinition | undefined {
  return ITEMS[itemId];
}

export function getAllItems(): ItemDefinition[] {
  return Object.values(ITEMS);
}

export function getItemsByCategory(
  category: ItemDefinition["category"],
): ItemDefinition[] {
  return Object.values(ITEMS).filter((i) => i.category === category);
}
