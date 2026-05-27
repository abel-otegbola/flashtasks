/* eslint-env node */
/* global process */

import { allowMethods, readJsonBody, sendError, sendJson } from '../../_shared/http.js';
import { buildOAuthState, getProviderScopes, normalizeProvider } from '../core/index.js';
import { resolveTenant } from '../../_shared/tenant.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const body = await readJsonBody(req);
    const tenant = resolveTenant(req, body);
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
    const redirectUri = body.redirectUri || process.env.GOOGLE_REDIRECT_URI || process.env.GMAIL_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return sendError(res, 500, 'Google/Gmail OAuth is not configured');
    }

    const state = buildOAuthState({
      provider: normalizeProvider('gmail'),
      tenant,
      redirectUri,
      returnTo: body.returnTo || '',
    });

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', getProviderScopes('gmail').join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('state', state);

    return sendJson(res, 200, {
      provider: 'gmail',
      authorizationUrl: authUrl.toString(),
      state,
      scopes: getProviderScopes('gmail'),
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to create Gmail OAuth URL');
  }
}
