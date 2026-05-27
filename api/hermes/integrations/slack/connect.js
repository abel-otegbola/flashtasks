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
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = body.redirectUri || process.env.SLACK_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return sendError(res, 500, 'Slack OAuth is not configured');
    }

    const state = buildOAuthState({
      provider: normalizeProvider('slack'),
      tenant,
      redirectUri,
      returnTo: body.returnTo || '',
    });

    const authUrl = new URL('https://slack.com/oauth/v2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', getProviderScopes('slack').join(','));
    authUrl.searchParams.set('state', state);

    return sendJson(res, 200, {
      provider: 'slack',
      authorizationUrl: authUrl.toString(),
      state,
      scopes: getProviderScopes('slack'),
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to create Slack OAuth URL');
  }
}
