import { Rule } from './rule.js';
import { toolPoisoningRule } from './tool-poisoning.js';
import { credentialLeakRule } from './credential-leak.js';
import { overprivilegedRule } from './overprivileged.js';
import { authMissingRule } from './auth-missing.js';
import { ssrfRule } from './ssrf.js';
import { rceVectorsRule } from './rce-vectors.js';
import { supplyChainRule } from './supply-chain.js';
import { toxicFlowRule, toolShadowingRule } from './cross-server.js';

export const ALL_RULES: Rule[] = [
  toolPoisoningRule,
  credentialLeakRule,
  overprivilegedRule,
  authMissingRule,
  ssrfRule,
  rceVectorsRule,
  supplyChainRule,
  toxicFlowRule,
  toolShadowingRule,
];

export { toolPoisoningRule, credentialLeakRule, overprivilegedRule, authMissingRule, ssrfRule, rceVectorsRule, supplyChainRule, toxicFlowRule, toolShadowingRule };
export type { Rule } from './rule.js';
