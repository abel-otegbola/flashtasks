import { CheckCircleIcon, ClockIcon, SlackLogoIcon, WarningCircleIcon } from "@phosphor-icons/react";
import Button from "../button/button";
import type { HermesProvider } from "../../hermes/types";
import type { IntegrationConnectionRecord, IntegrationConnectionStatus } from "../../helpers/hermesIntegrationState";
import type { JSX } from "react";
import { GoogleLogoIcon } from "@phosphor-icons/react";

type IntegrationStatusCardProps = {
  provider: HermesProvider;
  title: string;
  description: string;
  status: IntegrationConnectionRecord;
  isConnecting?: boolean;
  onConnect: () => void;
};

const statusStyles: Record<IntegrationConnectionStatus, string> = {
  connected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  disconnected: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const statusIcons: Record<IntegrationConnectionStatus, JSX.Element> = {
  connected: <CheckCircleIcon size={18} weight="bold" />,
  pending: <ClockIcon size={18} weight="bold" />,
  failed: <WarningCircleIcon size={18} weight="bold" />,
  disconnected: <ClockIcon size={18} weight="bold" />,
};

const formatTimestamp = (value: string | null) => {
  if (!value) return null;

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

function IntegrationStatusCard({ provider, title, description, status, isConnecting, onConnect }: IntegrationStatusCardProps) {
  const connectedAt = formatTimestamp(status.lastConnectedAt);
  const actionLabel = isConnecting ? "Connecting..." : status.status === "connected" ? "Reconnect" : `Connect ${title}`;
  const connectionLabel = status.status === "connected" ? "Connected" : "Not connected";

  return (
    <section className="flex h-fit flex-col gap-3 rounded-lg border border-gray-500/15 bg-white p-6 dark:bg-dark-bg">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-500/[0.2]">
          {title === "Slack" ? <SlackLogoIcon size={24} /> : title === "Gmail" ? <GoogleLogoIcon size={24} /> : null  }
        </div>

        <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
          <span className={`inline-flex items-center gap-1 capitalize rounded-full pr-3 p-1 text-xs font-semibold ${statusStyles[status.status]}`}>
            {statusIcons[status.status]}
            {status.status}
          </span>
        </div>
      </div>
      
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>

      <div className="flex flex-col gap-3 rounded border border-gray-500/10 bg-slate-50 p-4 text-sm dark:border-gray-500/20 dark:bg-white/5 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500 dark:text-slate-400">Last connected</span>
          <span className="font-medium text-slate-900 dark:text-white">{connectedAt || "Not yet connected"}</span>
        </div>
      </div>

      {status.error ? <p className="text-sm text-rose-600 dark:text-rose-300">{status.error}</p> : null}

      <div className="mt-auto flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Provider: {provider}</p>
        <Button size="small" variant={status.status === "connected" ? "secondary" : "primary"} onClick={onConnect} disabled={isConnecting}>
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}

export default IntegrationStatusCard;
