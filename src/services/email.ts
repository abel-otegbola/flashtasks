export type TeamInvitationEmailPayload = {
  to: string;
  organizationName: string;
  inviterName?: string;
  inviteLink: string;
  role?: string;
};

export type TaskAssignmentEmailPayload = {
  to: string[];
  taskTitle: string;
  taskDescription?: string;
  organizationName?: string;
  assignedBy?: string;
  taskLink: string;
  dueDate?: string;
};

type EmailRequestPayload =
  | ({ type: 'team-invitation' } & TeamInvitationEmailPayload)
  | ({ type: 'task-assignment' } & TaskAssignmentEmailPayload);

async function sendEmail(payload: EmailRequestPayload) {
  try {
    const response = await fetch('/api/resend/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error || 'Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Email send failed', error);
    throw error;
  }
}

export async function sendTeamInvitationEmail(payload: TeamInvitationEmailPayload) {
  return sendEmail({ type: 'team-invitation', ...payload });
}

export async function sendTaskAssignmentEmail(payload: TaskAssignmentEmailPayload) {
  return sendEmail({ type: 'task-assignment', ...payload });
}
