import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Button from "../../../components/button/button";
import { useOrganizations } from "../../../context/organizationContext";
import { useUser } from "../../../context/authContext";
import { PencilLineIcon } from "@phosphor-icons/react";
import { TrashBinMinimalistic } from "@solar-icons/react";

// ─── Types ───────────────────────────────────────────────────────────────────

type AutomationStatus = "running" | "done" | "failed" | "pending";
type ReminderStatus = "scheduled" | "pending";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(value: string) {
  const d = new Date(value);
  return (
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

function isDueSoon(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  return diff > 0 && diff < 86_400_000 * 2; // within 48 hours
}

const STATUS_CLASSES: Record<string, string> = {
  running:   "bg-green-50  text-green-700  dark:bg-green-900/30 dark:text-green-400",
  done:      "bg-teal-50   text-teal-700   dark:bg-teal-900/30  dark:text-teal-400",
  failed:    "bg-red-50    text-red-700    dark:bg-red-900/30   dark:text-red-400",
  pending:   "bg-amber-50  text-amber-700  dark:bg-amber-900/30 dark:text-amber-400",
  scheduled: "bg-blue-50   text-blue-700   dark:bg-blue-900/30  dark:text-blue-400",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${STATUS_CLASSES[status] ?? STATUS_CLASSES.pending}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[8px] border border-gray-500/[0.08] bg-gray-100/40 dark:bg-dark-bg/60 p-3 space-y-2 animate-pulse">
      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-2.5 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

function EmptyState({
  icon,
  message,
  cta,
  ctaHref,
}: {
  icon: React.ReactNode;
  message: string;
  cta?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
      <div className="text-2xl text-gray-300 dark:text-gray-600">{icon}</div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {cta && ctaHref && (
        <Link
          to={ctaHref}
          className="mt-1 text-xs border border-gray-300 dark:border-gray-600 rounded-[8px] px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

function FilterTabs<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { label: string; value: T }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3 py-0.5 text-xs transition-colors border ${
            active === opt.value
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
              : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const AUTO_FILTERS: { label: string; value: AutomationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Done", value: "done" },
  { label: "Failed", value: "failed" },
];

const REM_FILTERS: { label: string; value: ReminderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Pending", value: "pending" },
];

function AutomationsPage() {
  const { user } = useUser();
  const {
    automations,
    getAutomations,
    reminders,
    getReminders,
    loading,
    updateAutomation,
    deleteAutomation,
    updateReminder,
    deleteReminder,
  } = useOrganizations();

  const [autoFilter, setAutoFilter] = useState<AutomationStatus | "all">("all");
  const [remFilter, setRemFilter] = useState<ReminderStatus | "all">("all");

  useEffect(() => {
    getAutomations(user!.$id);
    getReminders(user!.$id);
  }, [user?.$id]);

  const filteredAutomations = useMemo(
    () =>
      autoFilter === "all"
        ? automations
        : automations.filter((a) => a.status === autoFilter),
    [automations, autoFilter]
  );

  const filteredReminders = useMemo(
    () =>
      remFilter === "all"
        ? reminders
        : reminders.filter((r) => r.status === remFilter),
    [reminders, remFilter]
  );

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] xl:px-[16.66%] py-[10%] px-6 h-full mb-4">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-medium md:text-[40px] text-[20px] bg-gradient-to-r bg-clip-text text-transparent from-black dark:from-white to-primary leading-[120%]">
            Automations
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Review your current automation runs and reminders. Start a new automation when you need another workflow, insight, or follow-up.
          </p>
        </div>
        <Button href="/account/automations/create" size="small" className="max-[450px]:w-full">
          + Create automation
        </Button>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* ── Automations ── */}
        <section className="rounded-[10px] border border-gray-500/[0.12] bg-white dark:bg-dark-bg p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-sm">Current automations</h3>
              <p className="text-xs text-gray-500 mt-1">Latest runs for this workspace.</p>
            </div>
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
              {filteredAutomations.length}
            </span>
          </div>

          <FilterTabs
            options={AUTO_FILTERS}
            active={autoFilter}
            onChange={setAutoFilter}
          />

          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredAutomations.length > 0 ? (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
              {filteredAutomations.map((run) => (
                <div
                  key={run.$id}
                  className="rounded-[8px] border border-gray-500/[0.08] bg-gray-100/40 dark:bg-dark-bg/60 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1 flex-1 min-w-0">{run.task}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <StatusBadge status={run.status} />
                      <button
                        title="Edit"
                        onClick={() => updateAutomation(run.$id, {})}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors"
                      >
                        <PencilLineIcon />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => deleteAutomation(run.$id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <TrashBinMinimalistic />
                      </button>
                    </div>
                  </div>

                  {run.summary && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {run.summary}
                    </p>
                  )}

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400">
                    {run.nextStep && (
                      <span>→ {run.nextStep}</span>
                    )}
                    {run.nextStep && run.$createdAt && <span>·</span>}
                    {run.$createdAt && <span>{formatDate(run.$createdAt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🤖"
              message={
                autoFilter === "all"
                  ? "No automation runs yet."
                  : `No ${autoFilter} automations found.`
              }
              cta="+ Create automation"
              ctaHref="/account/automations/create"
            />
          )}
        </section>

        {/* ── Reminders ── */}
        <section className="rounded-[10px] border border-gray-500/[0.12] bg-white dark:bg-dark-bg p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-sm">Reminders</h3>
              <p className="text-xs text-gray-500 mt-1">Follow-ups and deadlines created by automation.</p>
            </div>
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
              {filteredReminders.length}
            </span>
          </div>

          <FilterTabs
            options={REM_FILTERS}
            active={remFilter}
            onChange={setRemFilter}
          />

          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredReminders.length > 0 ? (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
              {filteredReminders.map((reminder) => (
                <div
                  key={reminder.$id}
                  className="rounded-[8px] border border-gray-500/[0.08] bg-gray-100/40 dark:bg-dark-bg/60 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1 flex-1 min-w-0">{reminder.task}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <StatusBadge status={reminder.status} />
                      <button
                        title="Edit"
                        onClick={() => updateReminder(reminder.$id, {})}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors"
                      >
                        <PencilLineIcon />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => deleteReminder(reminder.$id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <TrashBinMinimalistic />
                      </button>
                    </div>
                  </div>

                  {reminder.note && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {reminder.note}
                    </p>
                  )}

                  {reminder.dueAt && (
                    <p
                      className={`mt-1.5 text-[11px] flex items-center gap-1 ${
                        isDueSoon(reminder.dueAt)
                          ? "text-amber-600 dark:text-amber-400 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      🕐 Due {formatDate(reminder.dueAt)}
                      {isDueSoon(reminder.dueAt) && (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0 text-[10px]">
                          soon
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🔔"
              message={
                remFilter === "all"
                  ? "No reminders scheduled."
                  : `No ${remFilter} reminders found.`
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default AutomationsPage;