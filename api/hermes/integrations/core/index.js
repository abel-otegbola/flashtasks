/* eslint-env node */
/* global process, Buffer */

import crypto from 'crypto';

const stateSecret = process.env.HERMES_OAUTH_STATE_SECRET || process.env.APPWRITE_API_KEY || 'hermes-state-secret';

const base64UrlEncode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const base64UrlDecode = (value) => JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));

const sign = (value) => crypto.createHmac('sha256', stateSecret).update(value).digest('base64url');

export const normalizeProvider = (provider) => {
  const value = String(provider || '').toLowerCase();
  if (value === 'gmail' || value === 'google' || value === 'email') return 'gmail';
  if (value === 'slack') return 'slack';
  return value;
};

export const buildOAuthState = (context) => {
  const payload = {
    ...context,
    issuedAt: new Date().toISOString(),
    nonce: crypto.randomBytes(8).toString('hex'),
  };

  const encoded = base64UrlEncode(payload);
  return `${encoded}.${sign(encoded)}`;
};

export const parseOAuthState = (state) => {
  if (!state) return null;

  const [encoded, signature] = String(state).split('.');
  if (!encoded || !signature) return null;

  if (sign(encoded) !== signature) {
    throw new Error('Invalid OAuth state signature');
  }

  return base64UrlDecode(encoded);
};

export const buildDocumentId = (provider, tenant, accountId = '') => {
  const clean = [provider, tenant.organizationId, tenant.workspaceId, tenant.userId, accountId]
    .filter(Boolean)
    .join('_')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  return clean.slice(0, 120) || `${provider}_${Date.now()}`;
};

export const getProviderScopes = (provider) => {
  switch (normalizeProvider(provider)) {
    case 'slack':
      return [
        'chat:write',
        'channels:history',
        'channels:read',
        'groups:history',
        'im:history',
        'mpim:history',
        'users:read',
        'team:read',
      ];
    case 'gmail':
      return [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
      ];
    default:
      return [];
  }
};

export const buildIntegrationRecord = ({ provider, tenant, account, tokens, metadata = {} }) => ({
  provider: normalizeProvider(provider),
  organizationId: tenant.organizationId || '',
  workspaceId: tenant.workspaceId || '',
  userId: tenant.userId || '',
  accountId: account.accountId || '',
  externalAccountId: account.externalAccountId || '',
  externalWorkspaceId: account.externalWorkspaceId || '',
  accountName: account.accountName || '',
  tokenType: tokens.tokenType || 'bearer',
  accessToken: tokens.accessToken || '',
  refreshToken: tokens.refreshToken || '',
  scope: tokens.scope || '',
  status: 'connected',
  metadata: JSON.stringify(metadata),
  connectedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
