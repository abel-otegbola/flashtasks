/* eslint-env node */

import { allowMethods, readJsonBody, sendError, sendJson } from '../_shared/http.js';
import { resolveTenant } from '../_shared/tenant.js';
import { buildDocumentId } from '../integrations/core/index.js';
import { createDocument, isHermesConfigured } from '../_shared/appwrite.js';

const COLLECTION_ID = process.env.HERMES_AUTOMATION_RULES_COLLECTION_ID || '';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const body = await readJsonBody(req);
    const tenant = resolveTenant(req, body);

    if (!body.name || !body.trigger) {
      return sendError(res, 400, 'Missing automation name or trigger');
    }

    const record = {
      organizationId: tenant.organizationId || '',
      workspaceId: tenant.workspaceId || '',
      userId: tenant.userId || '',
      name: body.name,
      trigger: JSON.stringify(body.trigger),
      conditions: JSON.stringify(body.conditions || []),
      actions: JSON.stringify(body.actions || []),
      enabled: body.enabled !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const documentId = buildDocumentId('rule', tenant, body.name);

    if (isHermesConfigured() && COLLECTION_ID) {
      await createDocument(COLLECTION_ID, documentId, record);
    }

    return sendJson(res, 200, {
      created: true,
      automation: {
        id: documentId,
        ...record,
      },
      stored: Boolean(isHermesConfigured() && COLLECTION_ID),
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to create automation');
  }
}
