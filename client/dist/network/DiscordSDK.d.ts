/**
 * Discord SDK integration stub.
 * For local development, returns mock auth data.
 * In production, this would use the real Discord Embedded App SDK.
 */
export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
}
export interface AuthResult {
    accessToken: string;
    user: DiscordUser;
}
/**
 * Initialize the Discord SDK — in dev mode returns mock data.
 */
export declare function initDiscordSDK(): Promise<AuthResult>;
export declare function getDiscordUser(): Promise<DiscordUser>;
/**
 * Stub for checking IAP entitlements.
 * In production, verifies purchase through Discord's API.
 */
export declare function getEntitlements(_skuId: string): Promise<boolean>;
