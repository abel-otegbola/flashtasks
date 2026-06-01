const sharedStyles = `
  body { margin: 0; padding: 0; background: #f6f7fb; font-family: Arial, Helvetica, sans-serif; color: #111827; }
  .wrapper { width: 100%; padding: 32px 16px; box-sizing: border-box; }
  .card { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); }
  .hero { padding: 28px 32px 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; }
  .brand { font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.75; margin-bottom: 10px; }
  .title { margin: 0; font-size: 28px; line-height: 1.15; }
  .content { padding: 32px; }
  .lead { margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #374151; }
  .detail { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; margin: 20px 0; }
  .detail-row { margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #334155; }
  .detail-row strong { color: #0f172a; }
  .button-wrap { margin: 28px 0 10px; }
  .button { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 700; font-size: 14px; }
  .muted { margin: 18px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6; }
  .footer { padding: 0 32px 32px; color: #94a3b8; font-size: 12px; line-height: 1.6; }
`;

function baseHtml({ title, preheader, body, ctaLabel, ctaUrl, footer }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="hero">
          <div class="brand">Flashtasks</div>
          <h1 class="title">${title}</h1>
        </div>
        <div class="content">
          <p class="lead">${preheader}</p>
          ${body}
          ${ctaUrl ? `<div class="button-wrap"><a class="button" href="${ctaUrl}" target="_blank" rel="noreferrer">${ctaLabel || 'Open Flashtasks'}</a></div>` : ''}
          <p class="muted">If the button does not work, copy this link into your browser: <a href="${ctaUrl}">${ctaUrl}</a></p>
        </div>
        <div class="footer">${footer || 'This message was sent from Flashtasks.'}</div>
      </div>
    </div>
  </body>
</html>`;
}

function asList(items) {
  return items
    .filter(Boolean)
    .map((item) => `<div class="detail-row">${item}</div>`)
    .join('');
}

export function buildTeamInvitationEmail({ organizationName, inviterName, inviteLink, role }) {
  const body = `
    <div class="detail">
      ${asList([
        `<strong>Organization:</strong> ${organizationName || 'Organization'}`,
        `<strong>Invited by:</strong> ${inviterName || 'A teammate'}`,
        `<strong>Role:</strong> ${role || 'member'}`,
      ])}
    </div>
    <p class="lead">You have been invited to join the workspace above. Open the button below to review the invite and accept it.</p>
  `;

  const html = baseHtml({
    title: 'You have a team invitation',
    preheader: `${inviterName || 'A teammate'} invited you to join ${organizationName || 'a workspace'} in Flashtasks.`,
    body,
    ctaLabel: 'Review invitation',
    ctaUrl: inviteLink,
    footer: 'If you were not expecting this invitation, you can safely ignore this email.',
  });

  const text = [
    'Flashtasks team invitation',
    `Organization: ${organizationName || 'Organization'}`,
    `Invited by: ${inviterName || 'A teammate'}`,
    `Role: ${role || 'member'}`,
    `Invitation link: ${inviteLink}`,
  ].join('\n');

  return { html, text };
}

export function buildTaskAssignmentEmail({ taskTitle, taskDescription, organizationName, assignedBy, taskLink, dueDate }) {
  const body = `
    <div class="detail">
      ${asList([
        `<strong>Task:</strong> ${taskTitle || 'Untitled task'}`,
        organizationName ? `<strong>Organization:</strong> ${organizationName}` : '',
        assignedBy ? `<strong>Assigned by:</strong> ${assignedBy}` : '',
        dueDate ? `<strong>Due date:</strong> ${dueDate}` : '',
      ])}
    </div>
    ${taskDescription ? `<p class="lead">${taskDescription}</p>` : '<p class="lead">A task was assigned to you. Open it to review the details and start working.</p>'}
  `;

  const html = baseHtml({
    title: 'New task assignment',
    preheader: `${assignedBy || 'A teammate'} assigned you ${taskTitle || 'a task'} in Flashtasks.`,
    body,
    ctaLabel: 'Open task',
    ctaUrl: taskLink,
    footer: 'Stay on top of your work by checking your task queue regularly.',
  });

  const text = [
    'Flashtasks task assignment',
    `Task: ${taskTitle || 'Untitled task'}`,
    organizationName ? `Organization: ${organizationName}` : '',
    assignedBy ? `Assigned by: ${assignedBy}` : '',
    dueDate ? `Due date: ${dueDate}` : '',
    taskDescription ? `Description: ${taskDescription}` : '',
    `Task link: ${taskLink}`,
  ].filter(Boolean).join('\n');

  return { html, text };
}
