import type { HermesProvider } from "../hermes/types";

export type IntegrationConnectionStatus = "connected" | "pending" | "failed" | "disconnected";

export type IntegrationConnectionRecord = {
  provider: HermesProvider;
  status: IntegrationConnectionStatus;
  lastConnectedAt: string | null;
  accountId: string | null;
  userId: string | null;
  workspaceId: string | null;
  error: string | null;
  updatedAt: string;
};

export type IntegrationConnectionStore = Record<HermesProvider, IntegrationConnectionRecord>;

const STORAGE_KEY = "flashtasks.hermes.integration-status";

const createRecord = (provider: HermesProvider, patch?: Partial<IntegrationConnectionRecord>): IntegrationConnectionRecord => ({
  provider,
  status: patch?.status || "disconnected",
  lastConnectedAt: patch?.lastConnectedAt || null,
  accountId: patch?.accountId || null,
  userId: patch?.userId || null,
  workspaceId: patch?.workspaceId || null,
  error: patch?.error || null,
  updatedAt: patch?.updatedAt || new Date().toISOString(),
});

export const createDefaultIntegrationConnectionStore = (): IntegrationConnectionStore => ({
  gmail: createRecord("gmail"),
  slack: createRecord("slack"),
});

export const readIntegrationConnectionStore = (): IntegrationConnectionStore => {
  if (typeof window === "undefined") {
    return createDefaultIntegrationConnectionStore();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultIntegrationConnectionStore();
    }

    const parsed = JSON.parse(raw) as Partial<IntegrationConnectionStore>;

    return {
      gmail: createRecord("gmail", parsed.gmail),
      slack: createRecord("slack", parsed.slack),
    };
  } catch {
    return createDefaultIntegrationConnectionStore();
  }
};

export const writeIntegrationConnectionStore = (store: IntegrationConnectionStore) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const updateIntegrationConnectionStore = (
  provider: HermesProvider,
  patch: Partial<IntegrationConnectionRecord>
): IntegrationConnectionStore => {
  const nextStore = readIntegrationConnectionStore();
  nextStore[provider] = createRecord(provider, {
    ...nextStore[provider],
    ...patch,
    updatedAt: new Date().toISOString(),
  });
  writeIntegrationConnectionStore(nextStore);
  return nextStore;
};
