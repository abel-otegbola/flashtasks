/* eslint-env node */
/* global process */

import { allowMethods, readJsonBody, sendError, sendJson } from '../../_shared/http.js';
import { decryptSecret } from '../../_shared/crypto.js';
import { listDocuments, isHermesConfigured } from '../../_shared/appwrite.js';

const COLLECTION_ID = process.env.HERMES_CONNECTED_ACCOUNTS_COLLECTION_ID || '';

const postSlackMessage = async ({ token, channel, text, threadTs }) => {
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

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const body = await readJsonBody(req);
    const connectionId = body.connectionId || body.accountId || body.integrationId;
    const channel = body.channel || body.channelId;
    const text = body.text || body.message;

    if (!connectionId || !channel || !text) {
      return sendError(res, 400, 'Missing connectionId, channel, or text');
    }

    if (!isHermesConfigured() || !COLLECTION_ID) {
      return sendError(res, 500, 'Hermes connected accounts collection is not configured');
    }

    const response = await listDocuments(COLLECTION_ID, [`equal("accountId", ["${connectionId}"])`, 'equal("provider", ["slack"])']);
    const account = (response.documents || [])[0];

    if (!account) {
      return sendError(res, 404, 'Slack connection not found');
    }

    const token = decryptSecret(account.accessToken);
    const result = await postSlackMessage({
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
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to send Slack message');
  }
}
