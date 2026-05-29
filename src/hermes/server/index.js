/* eslint-env node */
/* global process, Buffer */

import crypto from 'crypto';

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || '';

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
});

const request = async (method, path, body) => {
  if (!projectId || !apiKey || !databaseId) {
    throw new Error('Appwrite is not configured for Hermes');
  }

  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: buildHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let parsed;

  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    const message = parsed?.message || parsed?.error || 'Appwrite request failed';
    throw new Error(message);
  }

  return parsed;
};

export const hermesAppwriteConfig = {
  endpoint,
  projectId,
  apiKey,
  databaseId,
};

export const isHermesConfigured = () => Boolean(projectId && apiKey && databaseId);

export const createDocument = async (collectionId, documentId, data) => {
  return request('POST', `/databases/${databaseId}/collections/${collectionId}/documents`, {
    documentId,
    data,
  });
};

export const updateDocument = async (collectionId, documentId, data) => {
  return request('PATCH', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, {
    data,
  });
};

export const upsertDocument = async (collectionId, documentId, data) => {
  try {
    return await createDocument(collectionId, documentId, data);
  } catch (error) {
    console.log(error)
    return updateDocument(collectionId, documentId, data);
  }
};

export const deleteDocument = async (collectionId, documentId) => {
  return request('DELETE', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`);
};

export const listDocuments = async (collectionId, queries = []) => {
  const url = new URL(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents`);
  queries.forEach((query) => url.searchParams.append('queries[]', query));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: buildHeaders(),
  });

  const text = await response.text();
  let parsed;

  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    throw new Error(parsed?.message || parsed?.error || 'Appwrite list failed');
  }

  return parsed;
};

export const allowMethods = (req, res, methods) => {
  if (methods.includes(req.method)) return true;

  res.setHeader('Allow', methods.join(', '));
  res.status(405).send('Method not allowed');
  return false;
};

export const readJsonBody = async (req) => {
  if (typeof req.body === 'object' && req.body !== null) {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) return resolve({});

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
};

export const readRawBody = async (req) => {
  if (typeof req.body === 'string') {
    return req.body;
  }

  if (typeof req.body === 'object' && req.body !== null) {
    return JSON.stringify(req.body);
  }

  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
};

export const sendJson = (res, status, payload) => res.status(status).json(payload);

export const sendError = (res, status, message, details = {}) => {
  return res.status(status).json({ error: message, ...details });
};

export const resolveTenant = (req, body = {}) => ({
  organizationId: req.headers['x-organization-id'] || body.organizationId || body.orgId || '',
  workspaceId: req.headers['x-workspace-id'] || body.workspaceId || body.workspace || '',
  userId: req.headers['x-user-id'] || body.userId || '',
  userEmail: req.headers['x-user-email'] || body.userEmail || body.email || '',
  accountId: req.headers['x-account-id'] || body.accountId || '',
});

export const normalizeProvider = (provider) => {
  const value = String(provider || '').toLowerCase();
  if (value === 'gmail' || value === 'google' || value === 'email') return 'gmail';
  if (value === 'slack') return 'slack';
  return value;
};

const stateSecret = process.env.HERMES_OAUTH_STATE_SECRET || process.env.APPWRITE_API_KEY || 'hermes-state-secret';

const base64UrlEncode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const base64UrlDecode = (value) => JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
const sign = (value) => crypto.createHmac('sha256', stateSecret).update(value).digest('base64url');

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
  const clean = [provider, tenant.organizationId, tenant.workspaceId, tenant.userId, tenant.userEmail, accountId]
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
  userEmail: tenant.userEmail || metadata.email || '',
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
});

const deriveKey = () => {
  const secret = process.env.HERMES_ENCRYPTION_SECRET || process.env.APPWRITE_API_KEY || 'hermes-dev-secret';
  return crypto.createHash('sha256').update(secret).digest();
};

export const encryptSecret = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return ['v1', iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join('.');
};

export const decryptSecret = (payload) => {
  if (!payload) return '';

  const [version, ivHex, tagHex, encryptedHex] = String(payload).split('.');
  if (version !== 'v1' || !ivHex || !tagHex || !encryptedHex) {
    return String(payload);
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};

export const verifyHmacSignature = ({ rawBody, secret, signature, algorithm = 'sha256' }) => {
  if (!secret) return true;

  const expected = crypto.createHmac(algorithm, secret).update(rawBody).digest('hex');
  return expected === signature;
};

export const isSlackUrlVerification = (body = {}) => body.type === 'url_verification';
export const isSlackChallenge = (body = {}) => Boolean(body.challenge);

export const isSlackBotMessage = (event = {}) => Boolean(event.bot_id || event.subtype === 'bot_message' || event.user === 'USLACKBOT');

export const isSlackMessageEvent = (event = {}) => {
  const type = event.type || '';
  return type === 'message' || type === 'app_mention' || type === 'reaction_added';
};

export const getSlackConversationId = (event = {}) => {
  const channel = event.channel || event.channel_id || 'unknown-channel';
  const threadTs = event.thread_ts || event.ts || event.message_ts || 'unknown-ts';
  return `${channel}:${threadTs}`;
};

export const getSlackMessageDirection = (event = {}) => (isSlackBotMessage(event) ? 'outbound' : 'inbound');

export const normalizeSlackEvent = (body = {}) => {
  const event = body.event || body;
  const occurredAt = body.event_ts ? new Date(Number(body.event_ts) * 1000).toISOString() : new Date().toISOString();

  return {
    provider: normalizeProvider('slack'),
    eventType: body.type === 'event_callback' ? event.type || 'message' : body.type || event.type || 'message',
    organizationId: body.organizationId || body.orgId || '',
    workspaceId: body.team_id || body.team?.id || body.workspaceId || '',
    accountId: body.authed_user?.id || body.authorizations?.[0]?.user_id || body.user || '',
    conversationId: getSlackConversationId(event),
    messageId: event.client_msg_id || event.ts || body.event_id || '',
    direction: getSlackMessageDirection(event),
    actorEmail: event.user_profile?.email || event.user_email || '',
    occurredAt,
    payload: event,
  };
};

export const buildSlackThreadRecord = (tenant, event) => ({
  organizationId: tenant.organizationId || '',
  provider: normalizeProvider('slack'),
  workspaceId: tenant.workspaceId || event.workspaceId || '',
  accountId: tenant.accountId || event.accountId || '',
  userId: tenant.userId || '',
  userEmail: tenant.userEmail || event.actorEmail || '',
  threadKey: event.conversationId,
  subject: event.payload?.text || event.payload?.blocks?.[0]?.text?.text || '',
  lastInboundAt: event.direction === 'inbound' ? event.occurredAt : '',
  lastOutboundAt: event.direction === 'outbound' ? event.occurredAt : '',
  status: event.direction === 'inbound' ? 'pending' : 'open',
});

export const buildSlackActivityRecord = (tenant, event, message, severity = 'info') => ({
  organizationId: tenant.organizationId || '',
  provider: normalizeProvider('slack'),
  userId: tenant.userId || '',
  userEmail: tenant.userEmail || event.actorEmail || '',
  entityType: 'event',
  entityId: event.messageId || event.conversationId,
  message,
  severity,
  payload: JSON.stringify(event),
});

const getRequestBody = async (req, url) => {
  if (req.method === 'POST' || req.method === 'DELETE' || req.method === 'PUT' || req.method === 'PATCH') {
    try {
      return await readJsonBody(req);
    } catch {
      return {};
    }
  }

  return Object.fromEntries(url.searchParams.entries());
};

const makeDocumentId = (value) => String(value || `hermes_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);

const connectSlack = async (req, res, url, body) => {
  if (!allowMethods(req, res, ['POST'])) return;

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
};

const connectEmail = async (req, res, url, body) => {
  if (!allowMethods(req, res, ['POST'])) return;

  const tenant = resolveTenant(req, body);
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID;
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
};

const callbackSlack = async (req, res, url, body) => {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  const queryUrl = url;
  const code = body.code || queryUrl.searchParams.get('code');
  const state = body.state || queryUrl.searchParams.get('state');
  const redirectUri = body.redirectUri || process.env.SLACK_REDIRECT_URI;
  const collectionId = process.env.HERMES_CONNECTED_ACCOUNTS_COLLECTION_ID || '';

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

  if (isHermesConfigured() && collectionId) {
    await createDocument(collectionId, documentId, record);
  }

  return sendJson(res, 200, {
    connected: true,
    provider: 'slack',
    account: {
      workspaceId: result.team?.id || '',
      accountId: result.authed_user?.id || '',
      name: result.team?.name || '',
    },
    stored: Boolean(isHermesConfigured() && collectionId),
  });
};

const callbackEmail = async (req, res, url, body) => {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  const queryUrl = url;
  const code = body.code || queryUrl.searchParams.get('code');
  const state = body.state || queryUrl.searchParams.get('state');
  const redirectUri = body.redirectUri || process.env.GOOGLE_REDIRECT_URI || process.env.GMAIL_REDIRECT_URI;
  const collectionId = process.env.HERMES_CONNECTED_ACCOUNTS_COLLECTION_ID || '';

  if (!code) return sendError(res, 400, 'Missing OAuth code');

  const parsedState = parseOAuthState(state);
  if (!parsedState) return sendError(res, 400, 'Missing or invalid OAuth state');

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID || '',
      client_secret: process.env.VITE_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET || '',
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

  if (isHermesConfigured() && collectionId) {
    await createDocument(collectionId, documentId, record);
  }

  return sendJson(res, 200, {
    connected: true,
    provider: 'gmail',
    account: {
      email,
      name: profile.name || '',
    },
    stored: Boolean(isHermesConfigured() && collectionId),
  });
};

const sendSlackMessage = async ({ token, channel, text, threadTs }) => {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      channel,
      text,
      ...(threadTs ? { thread_ts: threadTs } : {}),
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Slack message failed');
  }

  return result;
};

const slackSend = async (req, res, body) => {
  if (!allowMethods(req, res, ['POST'])) return;

  const connectionId = body.connectionId || body.accountId || body.integrationId;
  const channel = body.channel || body.channelId;
  const text = body.text || body.message;
  const collectionId = process.env.HERMES_CONNECTED_ACCOUNTS_COLLECTION_ID || '';

  if (!connectionId || !channel || !text) {
    return sendError(res, 400, 'Missing connectionId, channel, or text');
  }

  if (!isHermesConfigured() || !collectionId) {
    return sendError(res, 500, 'Hermes connected accounts collection is not configured');
  }

  const response = await listDocuments(collectionId, [`equal("accountId", ["${connectionId}"])`, 'equal("provider", ["slack"])']);
  const account = (response.documents || [])[0];

  if (!account) {
    return sendError(res, 404, 'Slack connection not found');
  }

  const token = decryptSecret(account.accessToken);
  const result = await sendSlackMessage({
    token,
    channel,
    text,
    threadTs: body.threadTs || body.thread_ts || '',
  });

  return sendJson(res, 200, {
    sent: true,
    provider: 'slack',
    channel: result.channel,
    ts: result.ts,
    message: result.message,
  });
};

const integrationsList = async (req, res, body) => {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  const tenant = resolveTenant(req, body);
  const provider = String(body.provider || body.integration || '').toLowerCase();
  const collectionId = process.env.HERMES_CONNECTED_ACCOUNTS_COLLECTION_ID || '';

  if (!isHermesConfigured() || !collectionId) {
    return sendJson(res, 200, { connectedAccounts: [], configured: false });
  }

  const queries = [];
  if (tenant.organizationId) queries.push(`equal("organizationId", ["${tenant.organizationId}"])`);
  if (tenant.workspaceId) queries.push(`equal("workspaceId", ["${tenant.workspaceId}"])`);
  if (tenant.userId) queries.push(`equal("userId", ["${tenant.userId}"])`);
  if (!tenant.userId && tenant.userEmail) queries.push(`equal("userEmail", ["${tenant.userEmail}"])`);
  if (provider) queries.push(`equal("provider", ["${provider}"])`);

  const response = await listDocuments(collectionId, queries);

  return sendJson(res, 200, {
    connectedAccounts: response.documents || [],
    configured: true,
  });
};

const integrationsDisconnect = async (req, res, body) => {
  if (!allowMethods(req, res, ['POST', 'DELETE'])) return;

  const tenant = resolveTenant(req, body);
  const connectionId = body.connectionId || body.documentId || body.accountId;
  const collectionId = process.env.HERMES_CONNECTED_ACCOUNTS_COLLECTION_ID || '';

  if (!connectionId) {
    return sendError(res, 400, 'Missing connected account id');
  }

  if (!isHermesConfigured() || !collectionId) {
    return sendJson(res, 200, { disconnected: true, configured: false });
  }

  if (body.delete === true || req.method === 'DELETE') {
    await deleteDocument(collectionId, connectionId);
  } else {
    await updateDocument(collectionId, connectionId, {
      status: 'disconnected',
      disconnectedAt: new Date().toISOString(),
      organizationId: tenant.organizationId || '',
      workspaceId: tenant.workspaceId || '',
      userId: tenant.userId || '',
      userEmail: tenant.userEmail || '',
    });
  }

  return sendJson(res, 200, {
    disconnected: true,
    connectionId,
    configured: true,
  });
};

const slackWebhook = async (req, res, bodyText) => {
  if (!allowMethods(req, res, ['POST'])) return;

  const rawBody = bodyText;
  const signature = String(req.headers['x-slack-signature'] || '').replace(/^v0=/, '');
  const timestamp = req.headers['x-slack-request-timestamp'] || '';
  const signingSecret = process.env.SLACK_SIGNING_SECRET || '';

  const verified = verifyHmacSignature({
    rawBody: `v0:${timestamp}:${rawBody}`,
    secret: signingSecret,
    signature,
    algorithm: 'sha256',
  });

  if (!verified) {
    return sendError(res, 401, 'Invalid Slack signature');
  }

  const body = rawBody ? JSON.parse(rawBody) : {};
  const tenant = resolveTenant(req, body);

  if (isSlackUrlVerification(body) || isSlackChallenge(body)) {
    return sendJson(res, 200, { challenge: body.challenge });
  }

  const event = normalizeSlackEvent(body);

  if (!isSlackMessageEvent(event.payload) && body.type !== 'event_callback') {
    return sendJson(res, 200, {
      received: true,
      provider: 'slack',
      tenant,
      eventType: body.type || 'slack_event',
    });
  }

  const collectionThreadsId = process.env.HERMES_CONVERSATION_THREADS_COLLECTION_ID || '';
  const collectionLogsId = process.env.HERMES_ACTIVITY_LOGS_COLLECTION_ID || '';

  if (isHermesConfigured()) {
    if (collectionThreadsId) {
      const threadRecord = buildSlackThreadRecord(tenant, event);
      const threadDocumentId = makeDocumentId(event.conversationId);

      await createDocument(collectionThreadsId, threadDocumentId, threadRecord).catch(async () => {
        await updateDocument(collectionThreadsId, threadDocumentId, {
          ...threadRecord,
        });
      });
    }

    if (collectionLogsId) {
      await createDocument(
        collectionLogsId,
        makeDocumentId(`${event.messageId || event.conversationId}_${Date.now()}`),
        buildSlackActivityRecord(tenant, event, `Slack ${event.direction} event captured`)
      ).catch(() => {});
    }
  }

  return sendJson(res, 200, {
    received: true,
    provider: 'slack',
    tenant,
    eventType: event.eventType,
    conversationId: event.conversationId,
    direction: event.direction,
  });
};

const gmailWebhook = async (req, res, body) => {
  if (!allowMethods(req, res, ['POST'])) return;

  const tenant = resolveTenant(req, body);

  return sendJson(res, 200, {
    received: true,
    provider: 'gmail',
    tenant,
    eventType: body.message ? 'gmail_push' : body.type || 'gmail_event',
  });
};

const handleRoute = async (req, res, url, body, rawBody) => {
  const segments = url.pathname.replace(/^\/api\/hermes\/?/, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    return sendJson(res, 200, {
      service: 'hermes',
      routes: [
        '/api/hermes/integrations/slack/connect',
        '/api/hermes/integrations/slack/callback',
        '/api/hermes/integrations/email/connect',
        '/api/hermes/integrations/email/callback',
        '/api/hermes/integrations/slack/send',
        '/api/hermes/integrations/list',
        '/api/hermes/integrations/disconnect',
        '/api/hermes/webhooks/slack',
        '/api/hermes/webhooks/gmail',
      ],
    });
  }

  const [section, provider, action] = segments;

  if (section === 'integrations') {
    if (provider === 'slack' && action === 'connect') return connectSlack(req, res, url, body);
    if (provider === 'slack' && action === 'callback') return callbackSlack(req, res, url, body);
    if (provider === 'slack' && action === 'send') return slackSend(req, res, body);
    if (provider === 'email' && action === 'connect') return connectEmail(req, res, url, body);
    if (provider === 'email' && action === 'callback') return callbackEmail(req, res, url, body);
    if (provider === 'list' || (provider === undefined && action === undefined)) return integrationsList(req, res, body);
    if (provider === 'disconnect' || provider === undefined && action === 'disconnect') return integrationsDisconnect(req, res, body);
    if (provider === 'list') return integrationsList(req, res, body);
  }

  if (section === 'webhooks') {
    if (provider === 'slack' || segments[1] === 'slack') return slackWebhook(req, res, rawBody);
    if (provider === 'gmail' || segments[1] === 'gmail') return gmailWebhook(req, res, body);
  }

  if (section === 'integrations' && segments[1] === 'disconnect') {
    return integrationsDisconnect(req, res, body);
  }

  if (section === 'integrations' && segments[1] === 'list') {
    return integrationsList(req, res, body);
  }

  return sendError(res, 404, 'Hermes route not found');
};

export async function handleHermesRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const segments = url.pathname.replace(/^\/api\/hermes\/?/, '').split('/').filter(Boolean);
  const isSlackWebhook = segments[0] === 'webhooks' && segments[1] === 'slack';

  let body = {};
  let rawBody = '';

  if (isSlackWebhook) {
    rawBody = await readRawBody(req);
    body = rawBody ? JSON.parse(rawBody) : {};
  } else {
    body = await getRequestBody(req, url);
  }

  return handleRoute(req, res, url, body, rawBody);
}