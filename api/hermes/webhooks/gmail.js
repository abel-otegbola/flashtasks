/* eslint-env node */

import { allowMethods, readJsonBody, sendError, sendJson } from '../_shared/http.js';
import { resolveTenant } from '../_shared/tenant.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const body = await readJsonBody(req);
    const tenant = resolveTenant(req, body);

    return sendJson(res, 200, {
      received: true,
      provider: 'gmail',
      tenant,
      eventType: body.message ? 'gmail_push' : body.type || 'gmail_event',
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to process Gmail webhook');
  }
}
