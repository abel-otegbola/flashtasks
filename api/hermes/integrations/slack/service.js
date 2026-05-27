/* eslint-env node */

import { normalizeProvider } from '../core/index.js';

export const SLACK_PROVIDER = normalizeProvider('slack');

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
    provider: SLACK_PROVIDER,
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
  provider: SLACK_PROVIDER,
  workspaceId: tenant.workspaceId || event.workspaceId || '',
  accountId: tenant.accountId || event.accountId || '',
  threadKey: event.conversationId,
  subject: event.payload?.text || event.payload?.blocks?.[0]?.text?.text || '',
  lastInboundAt: event.direction === 'inbound' ? event.occurredAt : '',
  lastOutboundAt: event.direction === 'outbound' ? event.occurredAt : '',
  status: event.direction === 'inbound' ? 'pending' : 'open',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const buildSlackActivityRecord = (tenant, event, message, severity = 'info') => ({
  organizationId: tenant.organizationId || '',
  provider: SLACK_PROVIDER,
  entityType: 'event',
  entityId: event.messageId || event.conversationId,
  message,
  severity,
  payload: JSON.stringify(event),
  createdAt: new Date().toISOString(),
});

export const buildSlackFollowupJob = (tenant, event, actionType, runAt, payload = {}) => ({
  organizationId: tenant.organizationId || '',
  threadKey: event.conversationId,
  provider: SLACK_PROVIDER,
  jobType: actionType,
  status: 'queued',
  priority: actionType === 'draft_followup' ? 'high' : 'normal',
  payload: JSON.stringify({ ...payload, conversationId: event.conversationId, workspaceId: event.workspaceId }),
  runAt,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
