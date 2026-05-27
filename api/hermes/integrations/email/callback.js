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
    const redirectUri = body.redirectUri || process.env.GOOGLE_REDIRECT_URI || process.env.GMAIL_REDIRECT_URI;

    if (!code) return sendError(res, 400, 'Missing OAuth code');

    const parsedState = parseOAuthState(state);
    if (!parsedState) return sendError(res, 400, 'Missing or invalid OAuth state');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri || '',
      }).toString(),
    });

    const result = await tokenResponse.json();
    if (!tokenResponse.ok) {
      return sendError(res, 400, result.error_description || result.error || 'Gmail token exchange failed');
    }

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${result.access_token}` },
    });
    const profile = profileResponse.ok ? await profileResponse.json() : {};

    const email = profile.email || body.email || '';
    const record = buildIntegrationRecord({
      provider: 'gmail',
      tenant: parsedState.tenant || {},
      account: {
        accountId: profile.sub || email,
        externalAccountId: profile.sub || email,
        externalWorkspaceId: email ? `gmail:${email.split('@')[1] || 'workspace'}` : '',
        accountName: email || profile.name || 'Gmail account',
      },
      tokens: {
        accessToken: encryptSecret(result.access_token || ''),
        refreshToken: result.refresh_token ? encryptSecret(result.refresh_token) : '',
        tokenType: result.token_type || 'Bearer',
        scope: result.scope || '',
      },
      metadata: {
        email,
        name: profile.name || '',
      },
    });

    const documentId = buildDocumentId('gmail', parsedState.tenant, profile.sub || email || '');

    if (isHermesConfigured() && COLLECTION_ID) {
      await createDocument(COLLECTION_ID, documentId, record);
    }

    return sendJson(res, 200, {
      connected: true,
      provider: 'gmail',
      account: {
        email,
        accountId: profile.sub || '',
      },
      stored: Boolean(isHermesConfigured() && COLLECTION_ID),
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to connect Gmail');
  }
}
