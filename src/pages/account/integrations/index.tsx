"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import IntegrationStatusCard from "../../../components/integrations/integrationStatusCard";
import { startIntegration } from "../../../services/integration";
import { useUser } from "../../../context/authContext";
import { IntegrationRecord, useTasks } from "../../../context/tasksContext";
import type { IntegrationConnectionStore, Provider } from "../../../interface/integration";

type PlatformCard = {
  id: Provider;
  name: string;
  description: string;
};

export default function IntegrationsPage() {
  const { user } = useUser();
  const { getIntegrations } = useTasks();
  const [connecting, setConnecting] = useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStore, setConnectionStore] = useState<IntegrationRecord[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const resolvedCurrentUserId = currentUserId || (user as any)?.$id || (user as any)?.userId || "";

  const platforms = useMemo<PlatformCard[]>(() => ([
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect Gmail to monitor threads, schedule reminders, and draft follow-up replies.',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect Slack to track conversations, detect follow-ups, and send reminders automatically.',
    },
  ]), []);

  useEffect(() => {
    getIntegrations(user?.$id)
    .then((store) => {
      console.log(store)
      setConnectionStore(store);
    })
    .catch((error) => {
      console.error('Failed to fetch integrations', error);
      toast.error('Failed to fetch integrations');
    });
  }, [user]);

  useEffect(() => {
    setCurrentUserId((user as any)?.$id || (user as any)?.userId || "");
  }, [user]);

  const startConnect = async (platformId: Provider) => {
    if (!resolvedCurrentUserId) {
      toast.error('Sign in to connect an integration');
      setErrorMessage('Sign in to connect an integration');
      return;
    }

    setConnecting(platformId);
    setErrorMessage(null);

    try {
      const result = await startIntegration(platformId, {
        userId: resolvedCurrentUserId,
        workspaceId: undefined,
      });

      window.location.assign(result.authUrl);
    } catch (error: any) {
      const message = error?.message || 'Failed to start connection';
      toast.error(message);
      setErrorMessage(message);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="mx-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-500/[0.2] dark:bg-dark-bg md:m-0">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Integrations</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-300">
            Connect channels Flashtasks can monitor and act on.
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 min-h-[520px]">
        {platforms.map((platform) => (
          <IntegrationStatusCard
            key={platform.id}
            integration={connectionStore.find(Integration => Integration.provider === platform.id)}
            title={platform.name}
            description={platform.description}
            status={connectionStore.find(Integration => Integration.provider === platform.id) ? "connected" : "pending"}
            isConnecting={connecting === platform.id}
            onConnect={() => startConnect(platform.id)}
          />
        ))}
      </div>
    </div>
  );
}
