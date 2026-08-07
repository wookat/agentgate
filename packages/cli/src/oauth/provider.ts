import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';
import type { OAuthClientInformationMixed, OAuthClientMetadata, OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';
import { CLI_VERSION } from '../version.js';
import { getServerAuth, updateServerAuth } from './store.js';

/**
 * File-backed OAuthClientProvider for the interactive `agentgate auth login`
 * flow. Client registration and tokens persist in the agentgate config dir;
 * the PKCE verifier lives only for the duration of one login.
 */
export class FileOAuthProvider implements OAuthClientProvider {
  private verifier?: string;
  private authorizationUrl?: URL;

  constructor(
    private readonly serverUrl: string,
    private readonly redirect?: string,
    private readonly staticClientId?: string,
  ) {}

  get redirectUrl(): string | undefined {
    return this.redirect;
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      client_name: `agentgate CLI ${CLI_VERSION}`,
      client_uri: 'https://agentgate.zalize.com',
      redirect_uris: this.redirect ? [this.redirect] : [],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    };
  }

  clientInformation(): OAuthClientInformationMixed | undefined {
    if (this.staticClientId) return { client_id: this.staticClientId };
    return getServerAuth(this.serverUrl)?.clientInformation;
  }

  saveClientInformation(clientInformation: OAuthClientInformationMixed): void {
    updateServerAuth(this.serverUrl, { clientInformation });
  }

  tokens(): OAuthTokens | undefined {
    return getServerAuth(this.serverUrl)?.tokens;
  }

  saveTokens(tokens: OAuthTokens): void {
    updateServerAuth(this.serverUrl, {
      tokens,
      tokensExpireAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
    });
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    this.authorizationUrl = authorizationUrl;
  }

  /** The URL captured by redirectToAuthorization during auth(), if any. */
  pendingAuthorizationUrl(): URL | undefined {
    return this.authorizationUrl;
  }

  saveCodeVerifier(codeVerifier: string): void {
    this.verifier = codeVerifier;
  }

  codeVerifier(): string {
    if (!this.verifier) throw new Error('No PKCE code verifier saved for this login attempt');
    return this.verifier;
  }
}
