// POST endpoint to activate subscription and update user role
/* eslint-env node */
/* global process */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const { userId, planId, role, transactionId, subscriptionId } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('[dodo/activate] Activating subscription for user:', userId, 'role:', role);

    const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY;
    const dodoApiBase = process.env.DODO_API_BASE_URL || 'https://api.dodopayments.com/v1';
    const dodoEnv = process.env.DODO_PAYMENTS_ENVIRONMENT || 'live_mode';

    // Verify the subscription exists and is active with Dodo Payments
    if (subscriptionId && dodoApiKey) {
      try {
        const dodoRes = await fetch(`${dodoApiBase}/subscriptions/${subscriptionId}`, {
          headers: {
            'Authorization': `Bearer ${dodoApiKey}`,
            'Content-Type': 'application/json',
            ...(dodoEnv === 'test_mode' && { 'X-Dodo-Environment': 'test_mode' })
          }
        });

        if (!dodoRes.ok) {
          const errText = await dodoRes.text();
          console.error('[dodo/activate] Dodo subscription verification failed:', errText);
          return res.status(402).json({ error: 'Subscription could not be verified with Dodo Payments' });
        }

        const dodoData = await dodoRes.json();
        const dodoStatus = dodoData.status;

        if (dodoStatus !== 'active' && dodoStatus !== 'trialing') {
          console.warn('[dodo/activate] Subscription is not active. Status:', dodoStatus);
          return res.status(402).json({ error: `Subscription is not active (status: ${dodoStatus})` });
        }

        // Derive role from product ID if not explicitly provided
        const productId = dodoData.product_id;
        const proProductId = process.env.DODO_PRO_PRODUCT_ID;
        const enterpriseProductId = process.env.DODO_ENTERPRISE_PRODUCT_ID;

        const derivedRole =
          productId === enterpriseProductId ? 'enterprise'
          : productId === proProductId ? 'pro'
          : role; // fall back to client-provided role

        if (derivedRole !== role) {
          console.warn(
            `[dodo/activate] Role mismatch — client sent "${role}", product resolves to "${derivedRole}". Using verified role.`
          );
        }

        req.body.role = derivedRole;
      } catch (err) {
        console.error('[dodo/activate] Error verifying with Dodo Payments:', err);
        return res.status(500).json({ error: 'Failed to verify subscription with payment provider' });
      }
    } else {
      console.warn('[dodo/activate] Skipping Dodo verification — missing subscriptionId or API key');
    }

    const verifiedRole = req.body.role;

    // Update user preferences in Appwrite
    const appwriteEndpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const projectId = process.env.APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!apiKey || !projectId) {
      console.warn('[dodo/activate] Missing Appwrite configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Update user prefs to include role
    // Uses the session cookie forwarded from the client to act as that user
    const response = await fetch(`${appwriteEndpoint}/account/prefs`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'X-Fallback-Cookies': req.headers.cookie || ''
      },
      body: JSON.stringify({
        role: verifiedRole,
        subscriptionId: subscriptionId || '',
        transactionId: transactionId || '',
        planId: planId || '',
        activatedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[dodo/activate] Failed to update user prefs:', errText);
      return res.status(500).json({ error: 'Failed to update user subscription' });
    }

    console.log('[dodo/activate] User role updated successfully to:', verifiedRole);
    return res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      role: verifiedRole
    });
  } catch (error) {
    console.error('[dodo/activate] Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}