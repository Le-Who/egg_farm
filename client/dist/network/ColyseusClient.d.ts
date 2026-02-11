import { Room } from "colyseus.js";
import { HouseState } from "../../../shared/HouseState";
/** Join (or create) the player's house room */
export declare function joinHouseRoom(ownerId: string, discordId: string): Promise<Room<HouseState>>;
/** Visit a friend's house by their Discord ID */
export declare function joinFriendRoom(friendDiscordId: string, myDiscordId: string): Promise<Room<HouseState>>;
export declare function getRoom(): Room<HouseState> | null;
