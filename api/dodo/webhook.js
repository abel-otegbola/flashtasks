// POST webhook receiver for Dodo Payments
/* eslint-env node */
/* global process */
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    // Read raw body for signature verification (must happen before JSON.parse)
    const raw = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
    });

    // Verify webhook signature using DODO_WEBHOOK_SECRET
    const signature = req.headers['x-dodo-signature'];
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signature) {
        console.warn('[dodo/webhook] Missing signature header');
        return res.status(401).send('Missing signature');
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(raw)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.warn('[dodo/webhook] Invalid signature');
        return res.status(401).send('Invalid signature');
      }
    } else {
      console.warn('[dodo/webhook] DODO_WEBHOOK_SECRET not set — skipping signature check');
    }

    const payload = JSON.parse(raw);

    const event = payload.event;
    const data = payload.data;

    console.log('[dodo/webhook] Received event:', event);

    // Relevant subscription/payment events
    const handledEvents = [
      'subscription.created',
      'subscription.activated',
      'subscription.renewed',
      'payment.succeeded',
      'payment.success'
    ];

    if (handledEvents.includes(event)) {
      const subscriptionId = data.subscription_id || data.id || '';
      const customerId = data.customer_id || '';
      const metadata = data.metadata || {};
      const userId = metadata.userId || '';

      // Resolve role from product ID using env-configured product IDs
      const productId = data.product_id || metadata.productId || '';
      const proProductId = process.env.DODO_PRO_PRODUCT_ID;
      const enterpriseProductId = process.env.DODO_ENTERPRISE_PRODUCT_ID;

      let role =
        productId === enterpriseProductId ? 'enterprise'
        : productId === proProductId ? 'pro'
        : metadata.role || 'pro'; // fall back to metadata, then default to 'pro'

      console.log(`[dodo/webhook] Resolved role "${role}" from productId "${productId}"`);

      // Appwrite configuration
      const appwriteEndpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
      const projectId = process.env.APPWRITE_PROJECT_ID;
      const apiKey = process.env.APPWRITE_API_KEY;
      const databaseId = process.env.APPWRITE_DATABASE_ID;
      const collectionId = process.env.DODO_SUBSCRIPTION_COLLECTION_ID;

      if (!apiKey || !projectId || !databaseId || !collectionId) {
        console.warn('[dodo/webhook] Missing Appwrite configuration — skipping storage');
        return res.status(200).json({ received: true, stored: false });
      }

      const docId = subscriptionId || `${userId}_${Date.now()}`;
      const subscriptionData = {
        event,
        subscriptionId,
        customerId,
        userId,
        productId,
        role,
        status: data.status || 'active',
        verified: true,
        raw: JSON.stringify(data),
        createdAt: new Date().toISOString()
      };

      const appwriteHeaders = {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey
      };

      const baseUrl = `${appwriteEndpoint}/databases/${databaseId}/collections/${collectionId}/documents`;

      // Try to create first; fall back to PATCH update if the document already exists
      try {
        const createRes = await fetch(baseUrl, {
          method: 'POST',
          headers: appwriteHeaders,
          body: JSON.stringify({
            documentId: docId,
            data: subscriptionData
          })
        });

        if (!createRes.ok) {
          const createErr = await createRes.text();
          console.warn('[dodo/webhook] Create failed, attempting update:', createErr);

          const updateRes = await fetch(`${baseUrl}/${docId}`, {
            method: 'PATCH',
            headers: appwriteHeaders,
            body: JSON.stringify({ data: subscriptionData })
          });

          if (!updateRes.ok) {
            const updateErr = await updateRes.text();
            console.error('[dodo/webhook] Update also failed:', updateErr);
            // Still return 200 so Dodo does not keep retrying for a storage error
            return res.status(200).json({ received: true, stored: false });
          }
        }

        console.log('[dodo/webhook] Subscription record stored for docId:', docId);
      } catch (storeErr) {
        console.error('[dodo/webhook] Error storing subscription:', storeErr);
        return res.status(200).json({ received: true, stored: false });
      }
    } else {
      console.log('[dodo/webhook] Unhandled event type, ignoring:', event);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[dodo/webhook] Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}