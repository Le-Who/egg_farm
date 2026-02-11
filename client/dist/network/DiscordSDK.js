/**
 * Discord SDK integration stub.
 * For local development, returns mock auth data.
 * In production, this would use the real Discord Embedded App SDK.
 */
// Whether we're running inside Discord's iframe
const isDiscord = typeof window !== "undefined" && window.location.search.includes("frame_id");
/**
 * Initialize the Discord SDK — in dev mode returns mock data.
 */
export async function initDiscordSDK() {
    if (isDiscord) {
        // Production: Use real Discord SDK
        // const { DiscordSDK } = await import('@discord/embedded-app-sdk');
        // const sdk = new DiscordSDK(CLIENT_ID);
        // await sdk.ready();
        // const { code } = await sdk.commands.authorize({ ... });
        // ... exchange code for token ...
        throw new Error("Real Discord SDK not yet configured — set CLIENT_ID");
    }
    // Dev mode: return mock user
    console.log("[DiscordSDK] Running in dev mode — using mock identity");
    return {
        accessToken: "dev-mock-token",
        user: {
            id: "dev-user-001",
            username: "DevPlayer",
            discriminator: "0001",
            avatar: null,
        },
    };
}
/**
 * Get current user's Discord ID.
 * Call after initDiscordSDK().
 */
let cachedUser = null;
export async function getDiscordUser() {
    if (cachedUser)
        return cachedUser;
    const auth = await initDiscordSDK();
    cachedUser = auth.user;
    return cachedUser;
}
/**
 * Stub for checking IAP entitlements.
 * In production, verifies purchase through Discord's API.
 */
export async function getEntitlements(_skuId) {
    // In production: check Discord entitlements API
    console.log("[DiscordSDK] Entitlement check stubbed — always returns false in dev");
    return false;
}
