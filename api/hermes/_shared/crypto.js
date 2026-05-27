/* eslint-env node */
/* global process, Buffer */

import crypto from 'crypto';

const deriveKey = () => {
  const secret = process.env.HERMES_ENCRYPTION_SECRET || process.env.APPWRITE_API_KEY || 'hermes-dev-secret';
  return crypto.createHash('sha256').update(secret).digest();
};

export const encryptSecret = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return ['v1', iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join('.');
};

export const decryptSecret = (payload) => {
  if (!payload) return '';

  const [version, ivHex, tagHex, encryptedHex] = String(payload).split('.');
  if (version !== 'v1' || !ivHex || !tagHex || !encryptedHex) {
    return String(payload);
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};

export const verifyHmacSignature = ({ rawBody, secret, signature, algorithm = 'sha256' }) => {
  if (!secret) return true;

  const expected = crypto.createHmac(algorithm, secret).update(rawBody).digest('hex');
  return expected === signature;
};
