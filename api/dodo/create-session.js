// POST /api/dodo/create-session
// Creates a Dodo Payments checkout session and returns the checkout URL.
// The secret API key never leaves the server.
/* eslint-env node */
/* global process */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const { productId, email, name, metadata = {} } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const apiBase = process.env.DODO_API_BASE_URL || 'https://api.dodopayments.com/v1';
    const environment = process.env.DODO_PAYMENTS_ENVIRONMENT || 'live_mode';
    const webhookUrl = process.env.DODO_WEBHOOK_URL;

    if (!apiKey) {
      console.error('[dodo/create-session] Missing DODO_PAYMENTS_API_KEY');
      return res.status(500).json({ error: 'Payment provider not configured' });
    }

    const body = {
      product_cart: [{ product_id: productId, quantity: 1 }],
      ...(email || name
        ? {
            customer: {
              ...(email && { email }),
              ...(name && { name }),
            },
          }
        : {}),
      metadata,
      ...(webhookUrl && { webhook_url: webhookUrl }),
    };

    const sessionRes = await fetch(`${apiBase}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(environment === 'test_mode' && { 'X-Dodo-Environment': 'test_mode' }),
      },
      body: JSON.stringify(body),
    });

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      console.error('[dodo/create-session] Dodo API error:', errText);
      return res.status(502).json({ error: 'Failed to create checkout session' });
    }

    const session = await sessionRes.json();

    // Dodo returns `url` or `checkout_url` depending on endpoint version
    const checkoutUrl = session.url ?? session.checkout_url;

    if (!checkoutUrl) {
      console.error('[dodo/create-session] No URL in response:', session);
      return res.status(502).json({ error: 'No checkout URL returned by Dodo' });
    }

    return res.status(200).json({ checkoutUrl, sessionId: session.id ?? null });
  } catch (error) {
    console.error('[dodo/create-session] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}