/* eslint-env node */
/* global process */
import { buildTaskAssignmentEmail, buildTeamInvitationEmail } from './templates.js';

const getResendKey = () => process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
const getFromAddress = () => process.env.RESEND_FROM_EMAIL || 'Flashtasks <noreply@flashtasks.app>';

async function sendResendEmail({ to, subject, html, text }) {
  const apiKey = getResendKey();
  if (!apiKey) {
    throw new Error('Resend is not configured on the server');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to,
      subject,
      html,
      text,
    }),
  });

  const resultText = await response.text();
  let result;

  try {
    result = JSON.parse(resultText);
  } catch {
    result = { raw: resultText };
  }

  if (!response.ok) {
    throw new Error(result?.message || result?.error || 'Failed to send email');
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const type = payload.type;
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to].filter(Boolean);

    if (!type || recipients.length === 0) {
      return res.status(400).json({ error: 'Missing email type or recipients' });
    }

    const sends = recipients.map(async (recipient) => {
      if (type === 'team-invitation') {
        const { html, text } = buildTeamInvitationEmail(payload);
        return sendResendEmail({
          to: recipient,
          subject: payload.subject || `You're invited to ${payload.organizationName || 'a workspace'} in Flashtasks`,
          html,
          text,
        });
      }

      if (type === 'task-assignment') {
        const { html, text } = buildTaskAssignmentEmail(payload);
        return sendResendEmail({
          to: recipient,
          subject: payload.subject || `New task assigned: ${payload.taskTitle || 'Untitled task'}`,
          html,
          text,
        });
      }

      throw new Error('Unsupported email type');
    });

    const results = await Promise.all(sends);
    return res.status(200).json({ ok: true, results });
  } catch (error) {
    console.error('[resend/send] error', error);
    return res.status(500).json({ error: error?.message || 'Failed to send email' });
  }
}
