import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../../../components/button/button";
import { useOrganizations } from "../../../context/organizationContext";
import { useUser } from "../../../context/authContext";
import {
  AutomationReminderRecord,
  AutomationRunRecord,
  listAutomationReminders,
  listAutomationRuns,
} from "../../../services/automation";

function formatAutomationDate(value: string) {
  return new Date(value).toLocaleString();
}

function AutomationsPage() {
  const { user } = useUser();
  const { currentOrg } = useOrganizations();
  const [automationRuns, setAutomationRuns] = useState<AutomationRunRecord[]>([]);
  const [automationReminders, setAutomationReminders] = useState<AutomationReminderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.$id || !currentOrg?.$id) {
        setAutomationRuns([]);
        setAutomationReminders([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [runsResponse, remindersResponse] = await Promise.all([
          listAutomationRuns({ limit: 10, userId: user.$id, workspaceId: currentOrg.$id }),
          listAutomationReminders({ limit: 10, userId: user.$id, workspaceId: currentOrg.$id }),
        ]);

        setAutomationRuns(runsResponse.runs || []);
        setAutomationReminders(remindersResponse.reminders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load automations.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [currentOrg?.$id, user?.$id]);

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] xl:px-[16.66%] py-[10%] px-6 h-full mb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-medium md:text-[40px] text-[20px] bg-gradient-to-r bg-clip-text text-transparent from-black dark:from-white to-primary leading-[120%]">
            Automations
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Review your current automation runs and reminders. Start a new automation when you need another workflow, insight, or follow-up.
          </p>
        </div>

        <Button href="/account/automations/create" size="small" className="max-[450px]:w-full">
          + Create automation
        </Button>
      </div>

      {error && (
        <div className="rounded-[10px] border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[10px] border border-gray-500/[0.12] bg-white dark:bg-dark-bg p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-sm">Current automations</h3>
              <p className="text-xs text-gray-400 mt-1">Latest automation runs for this workspace.</p>
            </div>
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
              {automationRuns.length}
            </span>
          </div>

          {loading ? (
            <div className="text-sm text-gray-400">Loading automations…</div>
          ) : automationRuns.length > 0 ? (
            <div className="space-y-3">
              {automationRuns.map((run) => (
                <div key={run.$id} className="rounded-[10px] border border-gray-500/[0.08] bg-bg-gray-100/40 dark:bg-dark-bg/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1">{run.task}</p>
                    <span className="text-[11px] text-gray-400">{run.status}</span>
                  </div>
                  {run.summary && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{run.summary}</p>}
                  {run.nextStep && <p className="mt-1 text-[11px] text-gray-400">Next step: {run.nextStep}</p>}
                  {run.$createdAt && <p className="mt-1 text-[11px] text-gray-400">Created {formatAutomationDate(run.$createdAt)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[10px] border border-dashed border-gray-500/[0.14] bg-bg-gray-100/30 dark:bg-dark-bg/50 p-4 text-sm text-gray-400">
              No automation runs yet. Create your first automation to get started.
              <div className="mt-3">
                <Button href="/account/automations/create" size="small" variant="secondary">
                  Create automation
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[10px] border border-gray-500/[0.12] bg-white dark:bg-dark-bg p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-sm">Reminders</h3>
              <p className="text-xs text-gray-400 mt-1">Follow-ups and deadlines created by automation.</p>
            </div>
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
              {automationReminders.length}
            </span>
          </div>

          {loading ? (
            <div className="text-sm text-gray-400">Loading reminders…</div>
          ) : automationReminders.length > 0 ? (
            <div className="space-y-3">
              {automationReminders.map((reminder) => (
                <div key={reminder.$id} className="rounded-[10px] border border-gray-500/[0.08] bg-bg-gray-100/40 dark:bg-dark-bg/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1">{reminder.task}</p>
                    <span className="text-[11px] text-gray-400">{reminder.status}</span>
                  </div>
                  {reminder.note && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{reminder.note}</p>}
                  {reminder.dueAt && <p className="mt-1 text-[11px] text-gray-400">Due {formatAutomationDate(reminder.dueAt)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No reminders scheduled.</p>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-gray-500/[0.12] bg-bg-gray-100/40 dark:bg-dark-bg/60 p-4">
        <div>
          <p className="text-sm font-medium">Want to create a new automation?</p>
          <p className="text-xs text-gray-400 mt-1">Open the builder to record, type, or upload the task you want automated.</p>
        </div>
        <Link to="/account/automations/create" className="text-sm font-medium text-primary">
          Create automation
        </Link>
      </div>
    </div>
  );
}

export default AutomationsPage;
