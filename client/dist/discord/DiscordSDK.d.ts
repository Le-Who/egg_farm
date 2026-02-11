/**
 * Discord SDK wrapper — stubbed for local development.
 * Real auth requires the app running inside Discord's iframe.
 */
export interface DiscordUser {
    id: string;
    username: string;
    avatar: string | null;
}
/** Authenticate with Discord (stubbed for MVP) */
export declare function authenticate(): Promise<DiscordUser>;
/** Set mock user for testing */
export declare function setMockUser(user: DiscordUser): void;
