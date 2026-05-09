/* eslint-env node */
/* global process */
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const file = payload.file;
    const folder = payload.folder || process.env.CLOUDINARY_UPLOAD_FOLDER || 'profile-photos';

    if (!file) {
      return res.status(400).json({ error: 'Missing file payload' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Cloudinary is not configured on the server' });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new URLSearchParams();
    formData.set('file', file);
    formData.set('api_key', apiKey);
    formData.set('timestamp', timestamp);
    formData.set('folder', folder);
    formData.set('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const resultText = await response.text();
    let result;

    try {
      result = JSON.parse(resultText);
    } catch {
      result = { raw: resultText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: result?.error?.message || 'Cloudinary upload failed',
      });
    }

    return res.status(200).json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error('[cloudinary/upload] error', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}