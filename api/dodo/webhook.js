// POST webhook receiver for Dodo Payments
/* eslint-env node */
/* global process */
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    // Read raw body
    const raw = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
    });

    const payload = JSON.parse(raw);
    
    // Verify webhook signature
    const signature = req.headers['x-dodo-signature'];
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(raw)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.warn('[dodo/webhook] Invalid signature');
        return res.status(401).send('Invalid signature');
      }
    }

    // Extract event data
    const event = payload.event;
    const data = payload.data;

    console.log('[dodo/webhook] Received event:', event);

    // Handle subscription events
    if (event === 'subscription.created' || event === 'subscription.activated' || event === 'payment.success') {
      const subscriptionId = data.subscription_id;
      const customerId = data.customer_id;
      const metadata = data.metadata || {};
      const userId = metadata.userId;
      const role = metadata.role || 'pro';

      // Store in Appwrite
      const appwriteEndpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
      const projectId = process.env.APPWRITE_PROJECT_ID;
      const apiKey = process.env.APPWRITE_API_KEY;
      const databaseId = process.env.APPWRITE_DATABASE_ID;
      const collectionId = process.env.DODO_SUBSCRIPTION_COLLECTION_ID;

      if (!apiKey || !projectId || !databaseId || !collectionId) {
        console.warn('[dodo/webhook] Missing Appwrite configuration');
        return res.status(200).json({ received: true, stored: false });
      }

      // Create or update subscription record
      const docId = subscriptionId || `${userId}_${Date.now()}`;
      const subscriptionData = {
        event,
        subscriptionId: subscriptionId || '',
        customerId: customerId || '',
        userId: userId || '',
        role: role,
        status: data.status || 'active',
        verified: true,
        raw: JSON.stringify(data),
        createdAt: new Date().toISOString()
      };

      try {
        const response = await fetch(
          `${appwriteEndpoint}/databases/${databaseId}/collections/${collectionId}/documents/${docId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': projectId,
              'X-Appwrite-Key': apiKey
            },
            body: JSON.stringify({
              documentId: docId,
              data: subscriptionData
            })
          }
        );

        if (!response.ok) {
          // Try to update instead
          const updateResponse = await fetch(
            `${appwriteEndpoint}/databases/${databaseId}/collections/${collectionId}/documents/${docId}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': projectId,
                'X-Appwrite-Key': apiKey
              },
              body: JSON.stringify({
                data: subscriptionData
              })
            }
          );

          if (!updateResponse.ok) {
            console.error('[dodo/webhook] Failed to store subscription:', await updateResponse.text());
          }
        }

        console.log('[dodo/webhook] Subscription stored successfully');
      } catch (error) {
        console.error('[dodo/webhook] Error storing subscription:', error);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[dodo/webhook] Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
