/* eslint-env node */

import { allowMethods, readJsonBody, sendError, sendJson } from '../_shared/http.js';
import { runAutomation } from './engine.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const body = await readJsonBody(req);
    const result = runAutomation({
      event: body.event || body,
      thread: body.thread || null,
      policy: body.policy || undefined,
    });

    return sendJson(res, 200, {
      executed: true,
      result,
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to execute automation');
  }
}
