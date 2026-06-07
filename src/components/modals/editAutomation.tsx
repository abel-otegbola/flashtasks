'use client';
import { useEffect, useRef, useState } from "react";
import { XIcon, PlusIcon, TrashIcon, CaretDownIcon, CaretUpIcon, LightningIcon, ClockIcon, ArrowsClockwiseIcon, WarningIcon } from "@phosphor-icons/react";
import Button from "../button/button";
import Input from "../input/input";
import Dropdown from "../dropdown/dropdown";
import { useOutsideClick } from "../../customHooks/useOutsideClick";
import LoadingIcon from "../../assets/icons/loading";
import { action, ActionData, Automation } from "../../interface/automation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  automation?: Automation | null;
  onSave?: (updated: Automation) => Promise<void> | void;
  loading?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_TYPES = [
  "create_task", "update_task", "complete_task",
  "review_tasks", "generate_followups", "prioritize_tasks",
  "send_email", "send_summary_email", "send_reminder",
  "notify_team", "searchEmails", "createDraft",
];

const STATUS_OPTIONS = [
  { title: "Active",   id: "active"   },
  { title: "Inactive", id: "inactive" },
  { title: "Paused",   id: "paused"   },
  { title: "Failed",   id: "failed"   },
];

const ACTION_STATUS_OPTIONS = [
  { title: "Pending", id: "pending" },
  { title: "Done",    id: "done"    },
  { title: "Failed",  id: "failed"  },
];

const PRIORITY_OPTIONS = [
  { title: "Low",    id: "low"    },
  { title: "Medium", id: "medium" },
  { title: "High",   id: "high"   },
];

const RECURRING_TYPE_OPTIONS = [
  { title: "Daily",   id: "daily"   },
  { title: "Weekly",  id: "weekly"  },
  { title: "Monthly", id: "monthly" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDataForDisplay(data: ActionData): string {
  try { return JSON.stringify(data, null, 2); } catch { return "{}"; }
}

function parseDataFromString(str: string): ActionData {
  try { return JSON.parse(str); } catch { return {} as ActionData; }
}

function statusColor(status: string) {
  switch (status) {
    case "active":  return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "inactive":return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    case "paused":  return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "failed":  return "text-red-500 bg-red-500/10 border-red-500/20";
    case "pending": return "text-sky-400 bg-sky-400/10 border-sky-400/20";
    case "done":    return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    default:        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  }
}

function priorityDot(priority?: string) {
  switch (priority) {
    case "high":   return "bg-red-500";
    case "medium": return "bg-amber-400";
    case "low":    return "bg-slate-400";
    default:       return "bg-slate-600";
  }
}

// ─── ActionCard ───────────────────────────────────────────────────────────────

interface ActionCardProps {
  act: action;
  index: number;
  onChange: (updated: action) => void;
  onRemove: () => void;
}

function ActionCard({ act, index, onChange, onRemove }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [dataStr, setDataStr]   = useState(() => formatDataForDisplay(act.data));
  const [dataErr, setDataErr]   = useState("");

  function handleDataChange(raw: string) {
    setDataStr(raw);
    try {
      JSON.parse(raw);
      setDataErr("");
      onChange({ ...act, data: parseDataFromString(raw) });
    } catch {
      setDataErr("Invalid JSON");
    }
  }

  function handleRecurringToggle(checked: boolean) {
    if (checked) {
      onChange({ ...act, recurring: { type: "daily", interval: 1 } });
    } else {
      const { recurring, ...rest } = act;
      onChange(rest as action);
    }
  }

  return (
    <div className="border border-gray-500/[0.15] rounded-lg overflow-hidden bg-gray-500/[0.02] dark:bg-white/[0.01]">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-gray-500/[0.04] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/[0.08] text-xs font-mono font-semibold text-gray-500 dark:text-gray-400 shrink-0">
          {index + 1}
        </span>

        <span className="flex-1 min-w-0">
          <span className="font-mono text-xs font-semibold tracking-tight text-gray-800 dark:text-gray-200 truncate block">
            {act.type || "unnamed_action"}
          </span>
        </span>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${statusColor(act.status)}`}>
            {act.status}
          </span>
          {act.priority && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(act.priority)}`} />
              {act.priority}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded hover:bg-red-500/10 hover:text-red-500 text-gray-400 transition-colors"
          >
            <TrashIcon size={13} />
          </button>
          {expanded ? <CaretUpIcon size={13} className="text-gray-400" /> : <CaretDownIcon size={13} className="text-gray-400" />}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-gray-500/[0.1]">
          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Action Type</label>
            <Dropdown
              variant="secondary"
              value={act.type}
              onChange={(val) => onChange({ ...act, type: val })}
              options={ACTION_TYPES.map(t => ({ title: t, id: t }))}
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
              <Dropdown
                variant="secondary"
                value={act.status}
                onChange={(val) => onChange({ ...act, status: val as action["status"] })}
                options={ACTION_STATUS_OPTIONS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Priority</label>
              <Dropdown
                variant="secondary"
                value={act.priority ?? "medium"}
                onChange={(val) => onChange({ ...act, priority: val as action["priority"] })}
                options={PRIORITY_OPTIONS}
              />
            </div>
          </div>

          {/* scheduledFor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Scheduled For</label>
            <input
              type="datetime-local"
              value={act.scheduledFor ? act.scheduledFor.slice(0, 16) : ""}
              onChange={(e) => onChange({ ...act, scheduledFor: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] dark:bg-white/[0.03] outline-none focus:border-gray-500/[0.4] transition-colors"
            />
          </div>

          {/* maxRetries */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Max Retries</label>
            <input
              type="number"
              min={0}
              max={10}
              value={act.maxRetries ?? 3}
              onChange={(e) => onChange({ ...act, maxRetries: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] dark:bg-white/[0.03] outline-none focus:border-gray-500/[0.4] transition-colors"
            />
          </div>

          {/* Recurring toggle */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!act.recurring}
                onChange={(e) => handleRecurringToggle(e.target.checked)}
                className="w-3.5 h-3.5 accent-current rounded"
              />
              <ArrowsClockwiseIcon size={12} />
              Recurring
            </label>

            {act.recurring && (
              <div className="grid grid-cols-2 gap-3 pl-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Type</label>
                  <Dropdown
                    variant="secondary"
                    value={act.recurring.type}
                    onChange={(val) => onChange({ ...act, recurring: { ...act.recurring!, type: val as "daily"|"weekly"|"monthly" } })}
                    options={RECURRING_TYPE_OPTIONS}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Interval</label>
                  <input
                    type="number"
                    min={1}
                    value={act.recurring.interval ?? 1}
                    onChange={(e) => onChange({ ...act, recurring: { ...act.recurring!, interval: parseInt(e.target.value) || 1 } })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] dark:bg-white/[0.03] outline-none focus:border-gray-500/[0.4] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* data JSON editor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Data <span className="font-mono text-[10px] text-gray-400">(JSON)</span>
            </label>
            <textarea
              value={dataStr}
              onChange={(e) => handleDataChange(e.target.value)}
              rows={5}
              spellCheck={false}
              className="w-full px-3 py-2 text-xs font-mono rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] dark:bg-white/[0.03] outline-none focus:border-gray-500/[0.4] transition-colors resize-y"
            />
            {dataErr && (
              <span className="flex items-center gap-1 text-[11px] text-red-500">
                <WarningIcon size={11} /> {dataErr}
              </span>
            )}
          </div>

          {/* Error (read-only) */}
          {act.error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-red-500/[0.06] border border-red-500/[0.15] text-xs text-red-400">
              <WarningIcon size={13} className="mt-0.5 shrink-0" />
              {act.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function EditAutomationModal({
  isOpen,
  onClose,
  automation,
  onSave,
  loading = false,
}: EditAutomationModalProps) {
  const modalRef = useOutsideClick(onClose, false);

  // Local form state
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [instruction, setInstruction] = useState("");
  const [status,      setStatus]      = useState<Automation["status"]>("active");
  const [schedule,    setSchedule]    = useState("");
  const [actions,     setActions]     = useState<action[]>([]);
  const [submitting,  setSubmitting]  = useState(false);

  // Sync when automation prop changes
  useEffect(() => {
    if (!automation) return;
    setTitle(automation.title ?? "");
    setDescription(automation.description ?? "");
    setInstruction(automation.instruction ?? "");
    setStatus(automation.status ?? "active");
    setSchedule(automation.schedule ?? "");
    setActions((automation.actions && typeof automation.actions === "string") ? JSON.parse(automation.actions) : []);
  }, [automation]);

  if (!isOpen) return null;

  // ── Action helpers ────────────────────────────────────────────────────────

  function addAction() {
    const blank: action = {
      id:           generateId(),
      type:         "create_task",
      params:       {},
      scheduledFor: null,
      status:       "pending",
      priority:     "medium",
      retryCount:   0,
      maxRetries:   3,
      data:         {} as ActionData,
    };
    setActions(prev => [...prev, blank]);
  }

  function updateAction(index: number, updated: action) {
    setActions(prev => prev.map((a, i) => i === index ? updated : a));
  }

  function removeAction(index: number) {
    setActions(prev => prev.filter((_, i) => i !== index));
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!automation) return;
    setSubmitting(true);
    try {
      const updated: Automation = {
        ...automation,
        title,
        description,
        instruction,
        status,
        schedule,
        actions,
      };
      await onSave?.(updated);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const isBusy = submitting || loading;

  // ── Meta info bar ─────────────────────────────────────────────────────────

  const metaItems = [
    automation?.lastRunAt && { label: "Last run", value: new Date(automation.lastRunAt).toLocaleString() },
    automation?.nextRunAt && { label: "Next run", value: new Date(automation.nextRunAt).toLocaleString() },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-dark shadow-xl w-[94%] max-w-2xl max-h-[85vh] flex flex-col border border-gray-500/[0.2] rounded-lg overflow-hidden"
      >
        {/* ── Sticky header ── */}
        <div className="sticky top-0 bg-white dark:bg-dark border-b border-gray-500/[0.1] z-[2] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <LightningIcon size={15} weight="fill" className="text-amber-400" />
            <h2 className="text-sm font-semibold leading-none opacity-80">Edit Automation</h2>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${statusColor(status)}`}>
              {status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors"
          >
            <XIcon size={15} />
          </button>
        </div>

        {/* ── Meta bar ── */}
        {metaItems.length > 0 && (
          <div className="flex items-center gap-5 px-5 py-2.5 bg-gray-500/[0.03] border-b border-gray-500/[0.08] shrink-0">
            {metaItems.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <ClockIcon size={11} />
                <span className="font-medium">{label}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Automation title"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What does this automation do?"
              className="w-full px-3 py-2.5 text-sm rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] dark:bg-white/[0.03] outline-none focus:border-gray-500/[0.4] transition-colors resize-none"
            />
          </div>

          {/* Instruction */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Instruction <span className="text-red-500">*</span>
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={3}
              placeholder="Natural-language instruction for this automation…"
              className="w-full px-3 py-2.5 text-sm rounded-md border border-gray-500/[0.2] bg-gray-500/[0.04] dark:bg-white/[0.03] outline-none focus:border-gray-500/[0.4] transition-colors resize-none"
            />
          </div>

          {/* Status + Schedule row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
              <Dropdown
                variant="secondary"
                value={status}
                onChange={(val) => setStatus(val as Automation["status"])}
                options={STATUS_OPTIONS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schedule</label>
              <Input
                value={schedule}
                name="schedule"
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="e.g. daily at 9am, 0 9 * * *"
              />
            </div>
          </div>

          {/* Last error */}
          {automation?.lastError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-md bg-red-500/[0.06] border border-red-500/[0.15] text-sm text-red-400">
              <WarningIcon size={15} className="mt-0.5 shrink-0" weight="fill" />
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide mb-1 text-red-500">Last Error</p>
                <p className="text-xs leading-relaxed">{automation.lastError}</p>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
                <span className="ml-2 font-normal normal-case text-gray-400">({actions.length})</span>
              </label>
              <button
                type="button"
                onClick={addAction}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-500/[0.2] hover:bg-gray-500/[0.06] transition-colors"
              >
                <PlusIcon size={12} weight="bold" />
                Add action
              </button>
            </div>

            {actions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 border border-dashed border-gray-500/[0.2] rounded-lg text-gray-400 text-sm gap-2">
                <LightningIcon size={22} weight="thin" />
                <span>No actions yet</span>
                <button
                  type="button"
                  onClick={addAction}
                  className="text-xs underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  Add your first action
                </button>
              </div>
            )}

            {actions?.map((act: any, i: number) => (
              <ActionCard
                key={act.id}
                act={act}
                index={i}
                onChange={(updated) => updateAction(i, updated)}
                onRemove={() => removeAction(i)}
              />
            ))}
          </div>
        </div>

        {/* ── Sticky footer ── */}
        <div className="sticky bottom-0 bg-white dark:bg-dark border-t border-gray-500/[0.2] px-5 py-4 flex justify-end gap-3 shrink-0">
          <Button variant="secondary" onClick={onClose} size="small" disabled={isBusy}>
            Cancel
          </Button>
          <Button
            type="button"
            size="small"
            disabled={isBusy || !title.trim() || !instruction.trim()}
            onClick={handleSave}
          >
            {isBusy ? <LoadingIcon className="animate-spin" /> : "Save Automation"}
          </Button>
        </div>
      </div>
    </div>
  );
}