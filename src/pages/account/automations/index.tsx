import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../../../components/button/button";
import { useOrganizations } from "../../../context/organizationContext";
import { useUser } from "../../../context/authContext";

function formatAutomationDate(value: string) {
  return new Date(value).toLocaleString();
}

function AutomationsPage() {
  const { user } = useUser();
  const { automations, getAutomations, reminders, getReminders, loading } = useOrganizations();

  useEffect(() => {
    getAutomations(user!.$id);
    getReminders(user!.$id);
  }, [user?.$id]);

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] xl:px-[16.66%] py-[10%] px-6 h-full mb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-medium md:text-[40px] text-[20px] bg-gradient-to-r bg-clip-text text-transparent from-black dark:from-white to-primary leading-[120%]">
            Automations
          </h1>
          <p className=" mt-2 max-w-2xl">
            Review your current automation runs and reminders. Start a new automation when you need another workflow, insight, or follow-up.
          </p>
        </div>

        <Button href="/account/automations/create" size="small" className="max-[450px]:w-full">
          + Create automation
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[10px] border border-gray-500/[0.12] bg-white dark:bg-dark-bg p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-sm">Current automations</h3>
              <p className="text-xs  mt-1">Latest automation runs for this workspace.</p>
            </div>
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
              {automations.length}
            </span>
          </div>

          {loading ? (
            <div className="text-sm ">Loading automations…</div>
          ) : automations.length > 0 ? (
            <div className="space-y-3">
              {automations.map((run) => (
                <div key={run.$id} className="rounded-[10px] border border-gray-500/[0.08] bg-bg-gray-100/40 dark:bg-dark-bg/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1">{run.task}</p>
                    <span className="text-[11px] ">{run.status}</span>
                  </div>
                  {run.summary && <p className="mt-1 text-xs text-gray-500 dark:">{run.summary}</p>}
                  {run.nextStep && <p className="mt-1 text-[11px] ">Next step: {run.nextStep}</p>}
                  {run.$createdAt && <p className="mt-1 text-[11px] ">Created {formatAutomationDate(run.$createdAt)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm ">
              No automation runs yet.
            </div>
          )}
        </section>

        <section className="rounded-[10px] border border-gray-500/[0.12] bg-white dark:bg-dark-bg p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-sm">Reminders</h3>
              <p className="text-xs  mt-1">Follow-ups and deadlines created by automation.</p>
            </div>
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
              {reminders.length}
            </span>
          </div>

          {loading ? (
            <div className="text-sm ">Loading reminders…</div>
          ) : reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.$id} className="rounded-[10px] border border-gray-500/[0.08] bg-bg-gray-100/40 dark:bg-dark-bg/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1">{reminder.task}</p>
                    <span className="text-[11px] ">{reminder.status}</span>
                  </div>
                  {reminder.note && <p className="mt-1 text-xs text-gray-500 dark:">{reminder.note}</p>}
                  {reminder.dueAt && <p className="mt-1 text-[11px] ">Due {formatAutomationDate(reminder.dueAt)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">No reminders scheduled.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default AutomationsPage;
