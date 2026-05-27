/* eslint-env node */
/* global process */

import { allowMethods, readJsonBody, sendError, sendJson } from '../../_shared/http.js';
import { buildDocumentId, buildIntegrationRecord, parseOAuthState } from '../core/index.js';
import { createDocument, isHermesConfigured } from '../../_shared/appwrite.js';
import { encryptSecret } from '../../_shared/crypto.js';

const COLLECTION_ID = process.env.HERMES_CONNECTED_ACCOUNTS_COLLECTION_ID || '';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  try {
    const queryUrl = new URL(req.url, 'http://localhost');
    const body = req.method === 'POST' ? await readJsonBody(req) : Object.fromEntries(queryUrl.searchParams.entries());
    const code = body.code || queryUrl.searchParams.get('code');
    const state = body.state || queryUrl.searchParams.get('state');
    const redirectUri = body.redirectUri || process.env.SLACK_REDIRECT_URI;

    if (!code) return sendError(res, 400, 'Missing OAuth code');

    const parsedState = parseOAuthState(state);
    if (!parsedState) return sendError(res, 400, 'Missing or invalid OAuth state');

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID || '',
        client_secret: process.env.SLACK_CLIENT_SECRET || '',
        code,
        redirect_uri: redirectUri || '',
      }).toString(),
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      return sendError(res, 400, result.error || 'Slack token exchange failed');
    }

    const record = buildIntegrationRecord({
      provider: 'slack',
      tenant: parsedState.tenant || {},
      account: {
        accountId: result.authed_user?.id || result.team?.id || '',
        externalAccountId: result.authed_user?.id || '',
        externalWorkspaceId: result.team?.id || '',
        accountName: result.team?.name || result.authed_user?.name || 'Slack workspace',
      },
      tokens: {
        accessToken: encryptSecret(result.access_token || ''),
        refreshToken: result.refresh_token ? encryptSecret(result.refresh_token) : '',
        tokenType: 'bearer',
        scope: result.scope || '',
      },
      metadata: {
        botUserId: result.bot_user_id || '',
        teamName: result.team?.name || '',
        teamId: result.team?.id || '',
      },
    });

    const documentId = buildDocumentId('slack', parsedState.tenant, result.team?.id || result.authed_user?.id || '');

    if (isHermesConfigured() && COLLECTION_ID) {
      await createDocument(COLLECTION_ID, documentId, record);
    }

    return sendJson(res, 200, {
      connected: true,
      provider: 'slack',
      account: {
        workspaceId: result.team?.id || '',
        accountId: result.authed_user?.id || '',
        name: result.team?.name || '',
      },
      stored: Boolean(isHermesConfigured() && COLLECTION_ID),
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to connect Slack');
  }
}
