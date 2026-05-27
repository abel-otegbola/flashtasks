export const defaultFollowupPolicy = {
  replyWindowHours: 24,
  reminderIntervalsHours: [24, 48, 72],
  stallWindowHours: 48,
};

const hoursBetween = (earlier, later) => {
  const start = new Date(earlier).getTime();
  const end = new Date(later).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, (end - start) / (1000 * 60 * 60));
};

export const normalizeEvent = (event) => ({
  provider: String(event.provider || '').toLowerCase(),
  eventType: String(event.eventType || event.type || ''),
  organizationId: event.organizationId || '',
  workspaceId: event.workspaceId || '',
  accountId: event.accountId || '',
  conversationId: event.conversationId || event.threadId || '',
  messageId: event.messageId || '',
  direction: event.direction || 'inbound',
  actorEmail: event.actorEmail || '',
  occurredAt: event.occurredAt || new Date().toISOString(),
  payload: event.payload || {},
});

export const evaluateFollowupRules = ({ thread, event, policy = defaultFollowupPolicy }) => {
  const normalizedEvent = normalizeEvent(event);
  const lastInboundAt = thread?.lastInboundAt || normalizedEvent.occurredAt;
  const lastOutboundAt = thread?.lastOutboundAt || '';
  const actions = [];

  const hoursSinceInbound = hoursBetween(lastInboundAt, new Date().toISOString());
  const hoursSinceOutbound = lastOutboundAt ? hoursBetween(lastOutboundAt, new Date().toISOString()) : Infinity;

  if (normalizedEvent.direction === 'inbound') {
    actions.push({
      type: 'schedule_reminder',
      dueAt: new Date(Date.now() + policy.replyWindowHours * 60 * 60 * 1000).toISOString(),
      payload: {
        conversationId: normalizedEvent.conversationId,
        accountId: normalizedEvent.accountId,
      },
    });
  }

  if (hoursSinceInbound >= policy.stallWindowHours && hoursSinceOutbound >= policy.replyWindowHours) {
    actions.push({
      type: 'draft_followup',
      payload: {
        conversationId: normalizedEvent.conversationId,
        reason: 'stalled_conversation',
      },
    });
    actions.push({
      type: 'update_task_status',
      payload: {
        conversationId: normalizedEvent.conversationId,
        status: 'pending',
      },
    });
  }

  return {
    event: normalizedEvent,
    actions,
    followupNeeded: actions.some((action) => action.type === 'draft_followup' || action.type === 'schedule_reminder'),
  };
};

export const runAutomation = (context) => {
  const decision = evaluateFollowupRules(context);
  return {
    ...decision,
    queuedJobs: decision.actions.map((action, index) => ({
      jobType: action.type,
      status: 'queued',
      priority: index === 0 ? 'high' : 'normal',
      payload: action.payload,
      runAt: action.dueAt || new Date().toISOString(),
    })),
  };
};
