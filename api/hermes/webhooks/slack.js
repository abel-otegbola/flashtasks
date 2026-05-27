/* eslint-env node */
/* global process */

import { allowMethods, readRawBody, sendError, sendJson } from '../_shared/http.js';
import { verifyHmacSignature } from '../_shared/crypto.js';
import { resolveTenant } from '../_shared/tenant.js';
import { createDocument, isHermesConfigured, updateDocument } from '../_shared/appwrite.js';
import { defaultFollowupPolicy, evaluateFollowupRules } from '../automation/engine.js';
import {
  buildSlackActivityRecord,
  buildSlackFollowupJob,
  buildSlackThreadRecord,
  isSlackChallenge,
  isSlackMessageEvent,
  isSlackUrlVerification,
  normalizeSlackEvent,
} from '../integrations/slack/service.js';

const THREADS_COLLECTION_ID = process.env.HERMES_CONVERSATION_THREADS_COLLECTION_ID || '';
const ACTIVITY_LOGS_COLLECTION_ID = process.env.HERMES_ACTIVITY_LOGS_COLLECTION_ID || '';
const FOLLOWUP_JOBS_COLLECTION_ID = process.env.HERMES_FOLLOWUP_JOBS_COLLECTION_ID || '';

const makeDocumentId = (value) => String(value || `slack_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const rawBody = await readRawBody(req);
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

    if (isHermesConfigured()) {
      if (THREADS_COLLECTION_ID) {
        const threadRecord = buildSlackThreadRecord(tenant, event);
        const threadDocumentId = makeDocumentId(event.conversationId);

        await createDocument(THREADS_COLLECTION_ID, threadDocumentId, threadRecord).catch(async () => {
          await updateDocument(THREADS_COLLECTION_ID, threadDocumentId, {
            ...threadRecord,
            updatedAt: new Date().toISOString(),
          });
        });
      }

      if (ACTIVITY_LOGS_COLLECTION_ID) {
        await createDocument(
          ACTIVITY_LOGS_COLLECTION_ID,
          makeDocumentId(`${event.messageId || event.conversationId}_${Date.now()}`),
          buildSlackActivityRecord(tenant, event, `Slack ${event.direction} event captured`)
        ).catch(() => {});
      }

      const evaluation = evaluateFollowupRules({
        event,
        thread: {
          lastInboundAt: event.direction === 'inbound' ? event.occurredAt : '',
          lastOutboundAt: event.direction === 'outbound' ? event.occurredAt : '',
        },
        policy: defaultFollowupPolicy,
      });

      if (FOLLOWUP_JOBS_COLLECTION_ID && evaluation.actions.length > 0) {
        for (const action of evaluation.actions) {
          await createDocument(
            FOLLOWUP_JOBS_COLLECTION_ID,
            makeDocumentId(`${action.type}_${event.conversationId}_${Date.now()}`),
            buildSlackFollowupJob(tenant, event, action.type, action.dueAt || new Date().toISOString(), action.payload)
          ).catch(() => {});
        }
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
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to process Slack webhook');
  }
}
