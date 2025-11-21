// Basic serverless endpoint stub to mark a user as active after checkout
// Secure this endpoint using your backend auth in production and verify via Paddle webhooks
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  try {
    const body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(JSON.parse(data || '{}')));
    });

    console.log('[paddle/activate] payload', body);

    // TODO: validate the purchase by verifying Paddle webhook / using vendor API
    // For now respond success — your app should check webhooks server-side before granting access

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('activate error', e);
    return res.status(500).json({ success: false });
  }
}
