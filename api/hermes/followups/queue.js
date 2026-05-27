/* eslint-env node */

import { allowMethods, sendError, sendJson } from '../_shared/http.js';
import { listDocuments, isHermesConfigured } from '../_shared/appwrite.js';

const COLLECTION_ID = process.env.HERMES_FOLLOWUP_JOBS_COLLECTION_ID || '';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;

  try {
    if (!isHermesConfigured() || !COLLECTION_ID) {
      return sendJson(res, 200, { jobs: [], configured: false });
    }

    const now = new Date().toISOString();
    const response = await listDocuments(COLLECTION_ID, [
      'equal("status", ["queued"])',
      `lessThanEqual("runAt", "${now}")`,
    ]);

    return sendJson(res, 200, {
      jobs: response.documents || [],
      configured: true,
    });
  } catch (error) {
    return sendError(res, 400, error.message || 'Failed to fetch follow-up queue');
  }
}
