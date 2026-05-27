"use client";
import { useMemo, useState } from "react";
import Button from "../../../components/button/button";
import { connectEmail, connectSlack } from "../../../services/hermes";
import { useUser } from "../../../context/authContext";
import toast from "react-hot-toast";

type PlatformCard = {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
};

export default function IntegrationsPage() {
  const { user } = useUser();
  const [connecting, setConnecting] = useState<string | null>(null);

  const platforms = useMemo<PlatformCard[]>(() => ([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect Slack to track conversations, detect follow-ups, and send reminders automatically.',
      status: 'available',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect Gmail to monitor threads, schedule reminders, and draft follow-up replies.',
      status: 'available',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Planned next. Hermes will support follow-ups across more channels soon.',
      status: 'coming-soon',
    },
  ]), []);

  const startConnect = async (platformId: string) => {
    if (!user) {
      toast.error('Sign in to connect an integration');
      return;
    }

    setConnecting(platformId);

    try {
      const tenant = {
        userId: (user as any).$id || (user as any).userId || '',
        organizationId: (user as any).organizationId || '',
        workspaceId: (user as any).workspaceId || '',
        accountId: (user as any).accountId || '',
      };

      const result = platformId === 'slack'
        ? await connectSlack(tenant)
        : await connectEmail(tenant);

      window.location.href = result.authorizationUrl;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to start connection');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-bg p-4 md:m-0 mx-4 rounded-lg border border-gray-200 dark:border-gray-500/[0.2]">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-sm text-gray-500">Connect channels Hermes can monitor and act on.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map((platform) => (
          <div key={platform.id} className="rounded-xl border border-gray-500/[0.1] p-5 bg-gray-50 dark:bg-dark-bg flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">{platform.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{platform.description}</p>
            </div>

            <div className="flex items-center justify-between gap-3 mt-auto">
              <span className={`text-xs px-2 py-1 rounded-full ${platform.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                {platform.status === 'available' ? 'Available' : 'Coming soon'}
              </span>

              {platform.status === 'available' ? (
                <Button
                  size="small"
                  onClick={() => startConnect(platform.id)}
                  disabled={connecting === platform.id}
                >
                  {connecting === platform.id ? 'Connecting...' : `Connect ${platform.name}`}
                </Button>
              ) : (
                <Button size="small" variant="secondary" disabled>
                  Soon
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
