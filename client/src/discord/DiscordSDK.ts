/**
 * Discord SDK wrapper — stubbed for local development.
 * Real auth requires the app running inside Discord's iframe.
 */

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
}

// In production, import from '@discord/embedded-app-sdk'
let mockUser: DiscordUser = {
  id: 'dev-user-001',
  username: 'DevPlayer',
  avatar: null,
};

/** Authenticate with Discord (stubbed for MVP) */
export async function authenticate(): Promise<DiscordUser> {
  // TODO: Replace with real Discord SDK auth
  // const { user } = await discordSdk.commands.authenticate({ ... });
  console.log('[DiscordSDK] Using mock auth for local development');
  return mockUser;
}

/** Set mock user for testing */
export function setMockUser(user: DiscordUser): void {
  mockUser = user;
}
