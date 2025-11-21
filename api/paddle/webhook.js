// POST webhook receiver for Paddle -- verify using your vendor public key and persist subscription
// This attempts to verify Paddle's p_signature using the vendor public key (PEM) set in env: PADDLE_PUBLIC_KEY
/* eslint-env node */
/* global process, Buffer */
import qs from 'qs';
import { serialize } from 'php-serialize';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    // Read raw body as string
    const raw = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
    });

    // Paddle sends application/x-www-form-urlencoded
    const parsed = qs.parse(raw.toString(), { allowDots: true, depth: 10 });

    const p_signature = parsed.p_signature || parsed['p_signature'];
    if (!p_signature) {
      console.warn('[paddle/webhook] no p_signature present');
      return res.status(400).send('Missing signature');
    }

    // Remove signature for verification
    delete parsed.p_signature;
    delete parsed['p_signature'];

    // Paddle expects the data to be serialized using PHP serialize with sorted keys
    const sortedKeys = Object.keys(parsed).sort();
    const sortedObj = {};
    for (const k of sortedKeys) sortedObj[k] = parsed[k];

    // php-serialize will convert JS objects/arrays into PHP serialized string
    const serialized = serialize(sortedObj);

    const publicKey = process.env.PADDLE_PUBLIC_KEY;
    if (!publicKey) {
      console.warn('[paddle/webhook] PADDLE_PUBLIC_KEY not configured — skipping verification');
    } else {
      const verifier = crypto.createVerify('sha1');
      verifier.update(serialized);
      const signature = Buffer.from(Array.isArray(p_signature) ? p_signature[0] : p_signature, 'base64');
      const ok = verifier.verify(publicKey, signature);
      if (!ok) {
        console.warn('[paddle/webhook] signature verification failed');
        return res.status(400).send('Invalid signature');
      }
    }

    // Persist webhook payload to Appwrite subscriptions collection if configured
    const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT;
    const APPWRITE_PROJECT = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;
    const APPWRITE_KEY = process.env.APPWRITE_API_KEY || process.env.APPWRITE_KEY;
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID;
    const SUBSCRIPTION_COLLECTION = process.env.PADDLE_SUBSCRIPTION_COLLECTION_ID || 'subscriptions';

    if (APPWRITE_ENDPOINT && APPWRITE_PROJECT && APPWRITE_KEY && DATABASE_ID) {
      try {
        const payloadToStore = {
          event: parsed.alert_name || parsed.alert || '',
          subscriptionId: parsed.subscription_id || parsed.subscription || '',
          passthrough: parsed.passthrough || parsed.passthrough || '',
          verified: !!publicKey,
          raw: raw.toString()
        };

        await fetch(`${APPWRITE_ENDPOINT}/v1/databases/${DATABASE_ID}/collections/${SUBSCRIPTION_COLLECTION}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': APPWRITE_PROJECT,
            'X-Appwrite-Key': APPWRITE_KEY
          },
          body: JSON.stringify({ documentId: 'unique()', data: payloadToStore })
        });
      } catch (e) {
        console.error('[paddle/webhook] failed to persist to Appwrite', e);
      }
    } else {
      console.warn('[paddle/webhook] Appwrite not configured; skipping persistence');
    }

    return res.status(200).send('OK');
  } catch (e) {
    console.error('paddle webhook error', e);
    return res.status(500).send('ERROR');
  }
};
