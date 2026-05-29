import { CheckCircleIcon, ClockIcon, WarningCircleIcon } from "@phosphor-icons/react";
import Button from "../button/button";
import type { HermesProvider } from "../../hermes/types";
import type { IntegrationConnectionRecord, IntegrationConnectionStatus } from "../../helpers/hermesIntegrationState";
import { JSX } from "react";

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

  return (
    <section className="flex h-full flex-col gap-5 rounded-3xl border border-gray-500/15 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.06)] dark:bg-dark-bg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">{title}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
        </div>

        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status.status]}`}>
          {statusIcons[status.status]}
          {status.status}
        </span>
      </div>

      <div className="rounded-2xl border border-gray-500/10 bg-slate-50 p-4 dark:border-gray-500/20 dark:bg-white/5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Connection</span>
          <span className="font-medium text-slate-900 dark:text-white">{status.status === "connected" ? "Active" : status.status === "pending" ? "In progress" : status.status === "failed" ? "Needs attention" : "Not connected"}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Last connected</span>
          <span className="font-medium text-slate-900 dark:text-white">{connectedAt || "Not yet connected"}</span>
        </div>

        {status.error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{status.error}</p> : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-300">Provider: {provider}</p>
        {
            status.status === "connected" ? (
                <Button size="small" variant="secondary" onClick={onConnect} disabled={isConnecting}>
                    Disconnect
                </Button>
            ) : <Button size="small" onClick={onConnect} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : `Connect ${title}`}
                </Button>
        }
      </div>
    </section>
  );
}

export default IntegrationStatusCard;
