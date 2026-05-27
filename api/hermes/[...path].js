/* eslint-env node */

import { handleHermesRequest } from '../../src/hermes/server/index.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  return handleHermesRequest(req, res);
}