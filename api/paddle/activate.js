// Endpoint to activate subscription and update user role
// This should verify the webhook was received before granting access
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  try {
    const body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(JSON.parse(data || '{}')));
    });

    const { userId, productId } = body;
    console.log('[paddle/activate] payload', body);

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }

    // Determine role based on product ID
    const proProductId = process.env.VITE_PADDLE_PRO_PRODUCT_ID;
    const enterpriseProductId = process.env.VITE_PADDLE_ENTERPRISE_PRODUCT_ID;
    
    let role = 'free';
    if (productId === proProductId) {
      role = 'pro';
    } else if (productId === enterpriseProductId) {
      role = 'enterprise';
    }

    // Update user preferences in Appwrite
    const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
    const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

    if (!APPWRITE_API_KEY || !APPWRITE_PROJECT_ID) {
      console.error('Missing Appwrite credentials');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    // Update user prefs via Appwrite REST API
    const response = await fetch(`${APPWRITE_ENDPOINT}/account/prefs`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY,
      },
      body: JSON.stringify({
        role: role
      })
    });

    if (!response.ok) {
      console.error('Failed to update user prefs:', await response.text());
      return res.status(500).json({ success: false, error: 'Failed to update user role' });
    }

    console.log(`[paddle/activate] User ${userId} upgraded to ${role}`);
    return res.status(200).json({ success: true, role });
  } catch (e) {
    console.error('activate error', e);
    return res.status(500).json({ success: false, error: e.message });
  }
}
