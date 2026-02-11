// Shared type definitions for client & server

export interface User {
  id: string;
  discordId: string;
  coins: number;
  gems: number;
  xp: number;
  lastLogin: Date;
}

export interface HouseItem {
  id: string;
  userId: string;
  itemId: string;
  gridX: number;
  gridY: number;
  state: Record<string, unknown>;
}

export interface ItemDefinition {
  id: string;
  name: string;
  category: "furniture" | "decoration" | "seed" | "special";
  price: number;
  currency: "coins" | "gems";
  /** Width in grid tiles */
  sizeX: number;
  /** Height in grid tiles */
  sizeY: number;
}

export interface Pet {
  id: string;
  userId: string;
  petType: string;
  stats: { level: number; hunger: number };
  isActive: boolean;
}
