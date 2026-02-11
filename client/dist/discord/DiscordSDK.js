/**
 * Discord SDK wrapper — stubbed for local development.
 * Real auth requires the app running inside Discord's iframe.
 */
// In production, import from '@discord/embedded-app-sdk'
let mockUser = {
    id: 'dev-user-001',
    username: 'DevPlayer',
    avatar: null,
};
/** Authenticate with Discord (stubbed for MVP) */
export async function authenticate() {
    // TODO: Replace with real Discord SDK auth
    // const { user } = await discordSdk.commands.authenticate({ ... });
    console.log('[DiscordSDK] Using mock auth for local development');
    return mockUser;
}
/** Set mock user for testing */
export function setMockUser(user) {
    mockUser = user;
}
