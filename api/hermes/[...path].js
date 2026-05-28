/* eslint-env node */

import { handleHermesRequest } from '../../src/hermes/server/index.js';

const allowedOrigins = new Set([
  'https://flashtasks.app',
  'https://www.flashtasks.app',
]);

const applyCors = (req, res) => {
  const origin = String(req.headers.origin || '').replace(/\/$/, '');

  if (allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return handleHermesRequest(req, res);
}