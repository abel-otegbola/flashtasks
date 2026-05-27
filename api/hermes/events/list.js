/* eslint-env node */

import { allowMethods, readJsonBody, sendError, sendJson } from '../_shared/http.js';
import { listDocuments, isHermesConfigured } from '../_shared/appwrite.js';
import { resolveTenant } from '../_shared/tenant.js';

const COLLECTION_ID = process.env.HERMES_ACTIVITY_LOGS_COLLECTION_ID || '';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;

  try {
    const body = req.method === 'POST' ? await readJsonBody(req) : Object.fromEntries(new URL(req.url, 'http://localhost').searchParams.entries());
    const tenant = resolveTenant(req, body);

    if (!isHermesConfigured() || !COLLECTION_ID) {
      return sendJson(res, 200, { events: [], configured: false });
    }

    const queries = [];
    if (tenant.organizationId) queries.push(`equal("organizationId", ["${tenant.organizationId}"])`);
    const response = await listDocuments(COLLECTION_ID, queries);

    return sendJson(res, 200, {
      events: response.documents || [],
      configured: true,
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to fetch Hermes events');
  }
}
