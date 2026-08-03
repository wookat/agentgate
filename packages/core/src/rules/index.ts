import { Rule } from './rule.js';
import { toolPoisoningRule } from './tool-poisoning.js';
import { credentialLeakRule } from './credential-leak.js';
import { overprivilegedRule } from './overprivileged.js';
import { authMissingRule } from './auth-missing.js';
import { ssrfRule } from './ssrf.js';
import { rceVectorsRule } from './rce-vectors.js';
import { supplyChainRule } from './supply-chain.js';

export const ALL_RULES: Rule[] = [
  toolPoisoningRule,
  credentialLeakRule,
  overprivilegedRule,
  authMissingRule,
  ssrfRule,
  rceVectorsRule,
  supplyChainRule,
];

export { toolPoisoningRule, credentialLeakRule, overprivilegedRule, authMissingRule, ssrfRule, rceVectorsRule, supplyChainRule };
export type { Rule } from './rule.js';
