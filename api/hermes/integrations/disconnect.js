/* eslint-env node */

import { allowMethods, readJsonBody, sendError, sendJson } from '../_shared/http.js';
import { deleteDocument, isHermesConfigured, updateDocument } from '../_shared/appwrite.js';
import { resolveTenant } from '../_shared/tenant.js';

const COLLECTION_ID = process.env.HERMES_CONNECTED_ACCOUNTS_COLLECTION_ID || '';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST', 'DELETE'])) return;

  try {
    const body = await readJsonBody(req);
    const tenant = resolveTenant(req, body);
    const connectionId = body.connectionId || body.documentId || body.accountId;

    if (!connectionId) {
      return sendError(res, 400, 'Missing connected account id');
    }

    if (!isHermesConfigured() || !COLLECTION_ID) {
      return sendJson(res, 200, { disconnected: true, configured: false });
    }

    if (body.delete === true || req.method === 'DELETE') {
      await deleteDocument(COLLECTION_ID, connectionId);
    } else {
      await updateDocument(COLLECTION_ID, connectionId, {
        status: 'disconnected',
        disconnectedAt: new Date().toISOString(),
        organizationId: tenant.organizationId || '',
        workspaceId: tenant.workspaceId || '',
        userId: tenant.userId || '',
      });
    }

    return sendJson(res, 200, {
      disconnected: true,
      connectionId,
      configured: true,
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to disconnect integration');
  }
}
