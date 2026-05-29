import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "@phosphor-icons/react";
import Button from "../../../components/button/button";
import { updateIntegrationConnectionStore } from "../../../helpers/hermesIntegrationState";
import type { HermesProvider } from "../../../hermes/types";

function IntegrationSuccessPage() {
  const [searchParams] = useSearchParams();

  const providerParam = searchParams.get("provider");
  const provider = providerParam === "gmail" || providerParam === "slack" ? providerParam : null;
  const accountId = searchParams.get("accountId");
  const userId = searchParams.get("userId");
  const workspaceId = searchParams.get("workspaceId");
  const expiresAt = searchParams.get("expiresAt");
  const connectedAt = searchParams.get("connectedAt") || new Date().toISOString();

  const summary = useMemo(() => ({
    provider,
    accountId,
    userId,
    workspaceId,
    expiresAt,
  }), [provider, accountId, userId, workspaceId, expiresAt]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    updateIntegrationConnectionStore(provider, {
      status: "connected",
      lastConnectedAt: connectedAt,
      accountId: accountId || null,
      userId: userId || null,
      workspaceId: workspaceId || null,
      error: null,
    });
  }, [provider, connectedAt, accountId, userId, workspaceId]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
      <div className="w-full rounded-[32px] border border-gray-500/15 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] dark:bg-dark-bg">
        <div className="flex flex-col gap-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <CheckCircleIcon size={34} weight="bold" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">Connected successfully</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{summary.provider || "Integration"} is now connected</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
              FlashTasks received the backend callback and saved the connection status locally.
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-gray-500/10 bg-slate-50 p-5 text-left text-sm dark:border-gray-500/20 dark:bg-white/5 sm:grid-cols-2">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Provider</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{summary.provider || "Not provided"}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Account ID</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{summary.accountId || "Not provided"}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">User ID</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{summary.userId || "Not provided"}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Expires at</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{summary.expiresAt || "No expiration provided"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/account/integrations">Back to integrations</Button>
            <Button href="/account/dashboard" variant="secondary">Go to dashboard</Button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Workspace: {summary.workspaceId || "No workspace attached"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default IntegrationSuccessPage;
