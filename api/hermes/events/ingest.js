/* eslint-env node */

import { allowMethods, readJsonBody, sendError, sendJson } from '../_shared/http.js';
import { resolveTenant } from '../_shared/tenant.js';
import { runAutomation } from '../automation/engine.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const body = await readJsonBody(req);
    const tenant = resolveTenant(req, body);
    const payload = body.payload || body.event || {};

    const result = runAutomation({
      event: {
        ...body,
        ...payload,
        organizationId: tenant.organizationId,
        workspaceId: tenant.workspaceId,
      },
      thread: body.thread || null,
    });

    return sendJson(res, 200, {
      received: true,
      tenant,
      result,
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to ingest Hermes event');
  }
}
