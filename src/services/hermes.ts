import { HermesTenant } from '../hermes/types';

type SlackConnectResponse = {
  authorizationUrl: string;
  state: string;
};

type EmailConnectResponse = SlackConnectResponse;

const getBackendBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_BACKEND_URL || 'https://flashtasks.app';
  return configuredBaseUrl.replace(/\/$/, '');
};

const getSlackRedirectUri = () => `${getBackendBaseUrl()}/api/hermes/integrations/slack/callback`;

const getGoogleRedirectUri = () => `${getBackendBaseUrl()}/api/hermes/integrations/email/callback`;

export const connectSlack = async (tenant: HermesTenant) => {
  const response = await fetch(`${getBackendBaseUrl()}/api/hermes/integrations/slack/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: tenant.userId,
      userEmail: tenant.userEmail,
      organizationId: tenant.organizationId,
      workspaceId: tenant.workspaceId,
      accountId: tenant.accountId,
      redirectUri: getSlackRedirectUri(),
      returnTo: '/account/settings?tab=integrations',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Failed to start Slack connection');
  }

  return (await response.json()) as SlackConnectResponse;
};

export const connectEmail = async (tenant: HermesTenant) => {
  const response = await fetch(`${getBackendBaseUrl()}/api/hermes/integrations/email/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: tenant.userId,
      userEmail: tenant.userEmail,
      organizationId: tenant.organizationId,
      workspaceId: tenant.workspaceId,
      accountId: tenant.accountId,
      redirectUri: getGoogleRedirectUri(),
      returnTo: '/account/settings?tab=integrations',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Failed to start Gmail connection');
  }

  return (await response.json()) as EmailConnectResponse;
};
