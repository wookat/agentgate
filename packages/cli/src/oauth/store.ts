import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { OAuthClientInformationMixed, OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';

export interface StoredServerAuth {
  clientInformation?: OAuthClientInformationMixed;
  tokens?: OAuthTokens;
  /** Epoch ms when the access token expires (derived from expires_in at save time). */
  tokensExpireAt?: number;
  updatedAt: string;
}

export type OAuthStore = Record<string, StoredServerAuth>;

export function storePath(): string {
  const base =
    process.env.AGENTGATE_CONFIG_DIR ??
    path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config'), 'agentgate');
  return path.join(base, 'oauth.json');
}

/** Server keys are the URL origin so one login covers every path on a host. */
export function originKey(serverUrl: string | URL): string {
  return new URL(serverUrl).origin;
}

export function readStore(): OAuthStore {
  try {
    return JSON.parse(fs.readFileSync(storePath(), 'utf8')) as OAuthStore;
  } catch {
    return {};
  }
}

export function writeStore(store: OAuthStore): void {
  const file = storePath();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, `${JSON.stringify(store, null, 2)}\n`, { mode: 0o600 });
}

export function updateServerAuth(serverUrl: string | URL, patch: Partial<StoredServerAuth>): void {
  const store = readStore();
  const key = originKey(serverUrl);
  store[key] = { ...store[key], ...patch, updatedAt: new Date().toISOString() };
  writeStore(store);
}

export function getServerAuth(serverUrl: string | URL): StoredServerAuth | undefined {
  return readStore()[originKey(serverUrl)];
}

export function removeServerAuth(serverUrl: string | URL): boolean {
  const store = readStore();
  const key = originKey(serverUrl);
  if (!(key in store)) return false;
  delete store[key];
  writeStore(store);
  return true;
}
