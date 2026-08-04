let enabled = false;

export function setDebug(value: boolean): void {
  enabled = value;
}

export function isDebug(): boolean {
  return enabled;
}

export function debugLog(...args: unknown[]): void {
  if (enabled) console.error('[agentgate:debug]', ...args);
}
