"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import IntegrationStatusCard from "../../../components/integrations/integrationStatusCard";
import { startIntegration } from "../../../services/hermes";
import { useUser } from "../../../context/authContext";
import { useTasks } from "../../../context/tasksContext";
import {
  createDefaultIntegrationConnectionStore,
  type IntegrationConnectionStore,
  writeIntegrationConnectionStore,
} from "../../../helpers/hermesIntegrationState";
import type { HermesProvider } from "../../../hermes/types";

type PlatformCard = {
  id: HermesProvider;
  name: string;
  description: string;
};

export default function IntegrationsPage() {
  const { user } = useUser();
  const { getIntegrations } = useTasks();
  const [connecting, setConnecting] = useState<HermesProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStore, setConnectionStore] = useState<IntegrationConnectionStore>(createDefaultIntegrationConnectionStore());
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const resolvedCurrentUserId = currentUserId || (user as any)?.$id || (user as any)?.userId || "";

  const platforms = useMemo<PlatformCard[]>(() => ([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect Slack to track conversations, detect follow-ups, and send reminders automatically.',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect Gmail to monitor threads, schedule reminders, and draft follow-up replies.',
    },
  ]), []);

  useEffect(() => {
    getIntegrations(user?.$id)
    .then((store) => {
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

  const persistConnectionStore = (nextStore: IntegrationConnectionStore) => {
    setConnectionStore(nextStore);
    writeIntegrationConnectionStore(nextStore);
  };

  const patchConnectionStore = (
    provider: HermesProvider,
    patch: Partial<IntegrationConnectionStore[HermesProvider]>
  ) => {
    const nextStore = {
      ...connectionStore,
      [provider]: {
        ...connectionStore[provider],
        ...patch,
        provider,
        updatedAt: new Date().toISOString(),
      },
    } as IntegrationConnectionStore;

    persistConnectionStore(nextStore);
    return nextStore;
  };

  const startConnect = async (platformId: HermesProvider) => {
    if (!resolvedCurrentUserId) {
      toast.error('Sign in to connect an integration');
      setErrorMessage('Sign in to connect an integration');
      return;
    }

    setConnecting(platformId);
    setErrorMessage(null);

    const pendingStore = patchConnectionStore(platformId, {
      status: 'pending',
      userId: resolvedCurrentUserId,
      workspaceId: null,
      error: null,
    });

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

      const failedStore = patchConnectionStore(platformId, {
        status: 'failed',
        userId: resolvedCurrentUserId,
        workspaceId: null,
        error: message,
      });
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="mx-4 rounded border border-gray-200 bg-white p-4 shadow-[0_10px_50px_rgba(15,23,42,0.04)] dark:border-gray-500/[0.2] dark:bg-dark-bg md:m-0">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Hermes integration layer</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Integrations</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-300">
            Connect channels Hermes can monitor and act on.
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {platforms.map((platform) => (
          <IntegrationStatusCard
            key={platform.id}
            provider={platform.id}
            title={platform.name}
            description={platform.description}
            status={connectionStore[platform.id] || createDefaultIntegrationConnectionStore()[platform.id]}
            isConnecting={connecting === platform.id}
            onConnect={() => startConnect(platform.id)}
          />
        ))}
      </div>
    </div>
  );
}
