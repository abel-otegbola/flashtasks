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

    // Update user preferences in Appwrite
    const appwriteEndpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const projectId = process.env.APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!apiKey || !projectId) {
      console.warn('[dodo/activate] Missing Appwrite configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Update user prefs to include role
    try {
      const response = await fetch(
        `${appwriteEndpoint}/account/prefs`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': projectId,
            'X-Appwrite-Key': apiKey,
            'X-Fallback-Cookies': req.headers.cookie || ''
          },
          body: JSON.stringify({
            role: role,
            subscriptionId: subscriptionId || '',
            transactionId: transactionId || '',
            planId: planId || '',
            activatedAt: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        console.error('[dodo/activate] Failed to update user prefs:', await response.text());
        return res.status(500).json({ error: 'Failed to update user subscription' });
      }

      console.log('[dodo/activate] User role updated successfully');
      return res.status(200).json({ 
        success: true, 
        message: 'Subscription activated successfully',
        role: role
      });
    } catch (error) {
      console.error('[dodo/activate] Error updating user:', error);
      return res.status(500).json({ error: 'Failed to activate subscription' });
    }
  } catch (error) {
    console.error('[dodo/activate] Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
