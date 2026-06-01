import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Button from "../../../components/button/button";
import { Upload } from "@solar-icons/react";
import { useOrganizations } from "../../../context/organizationContext";
import { useUser } from "../../../context/authContext";
import { useRealtimeTranscription } from "../../../helpers/audioTranscriber";
import { getMaxRecordingTime } from "../../../helpers/createTaskHelpers";
import { transcribeFile } from "../../../helpers/transcribeFile";
import {
  AutomationReminderRecord,
  AutomationRunRecord,
  AutomationRunResponse,
  listAutomationReminders,
  listAutomationRuns,
  runAutomation,
} from "../../../services/automation";

function AutomationPage() {
  const { user } = useUser();
  const { currentOrg } = useOrganizations();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [context, setContext] = useState("");
  const [automationRun, setAutomationRun] = useState<AutomationRunResponse | null>(null);
  const [automationRuns, setAutomationRuns] = useState<AutomationRunRecord[]>([]);
  const [automationReminders, setAutomationReminders] = useState<AutomationReminderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTranscribingFile, setIsTranscribingFile] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "Listening..." | "processing" | "error">("idle");

  const userRole = ((user as any)?.prefs?.role as string) || "free";
  const maxRecordingTime = getMaxRecordingTime(userRole);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.$id || !currentOrg?.$id) {
        setAutomationRuns([]);
        setAutomationReminders([]);
        return;
      }

      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const [runsResponse, remindersResponse] = await Promise.all([
          listAutomationRuns({ limit: 10, userId: user.$id, workspaceId: currentOrg.$id }),
          listAutomationReminders({ limit: 10, userId: user.$id, workspaceId: currentOrg.$id }),
        ]);

        setAutomationRuns(runsResponse.runs || []);
        setAutomationReminders(remindersResponse.reminders || []);
      } catch (err) {
        setHistoryError(err instanceof Error ? err.message : "Failed to load automation history.");
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [currentOrg?.$id, user?.$id]);

  const {
    status: transcriptionStatus,
    recordingTime,
    startRecording,
    stopRecording,
    error,
  } = useRealtimeTranscription({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,

    onInterimTranscript: (text) => {
      setInterimText(text);
      setStatus("Listening...");
    },

    onFinalTranscript: (text) => {
      setStatus("idle");
      setFinalText(text);
      setInterimText("");
    },
  });

  const isRecording = transcriptionStatus === "recording";
  const isSupported = transcriptionStatus !== "error";
  const displayText = interimText ? `${finalText} ${interimText}`.trim() : finalText;
  const displayError = error;

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    if (recordingTime >= maxRecordingTime) {
      setHistoryError("Recording limit reached. Upgrade your plan for more time.");
      return;
    }

    setHistoryError(null);
    startRecording();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribingFile(true);
    try {
      const text = await transcribeFile(file);
      if (text) setFinalText((prev) => (prev ? `${prev} ${text}` : text));
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Failed to transcribe file.");
    } finally {
      setIsTranscribingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRunAutomation = async () => {
    const nextTask = displayText.trim();

    if (!nextTask) {
      setHistoryError("Please enter a task first.");
      return;
    }

    setLoading(true);
    setHistoryError(null);

    try {
      const response = await runAutomation({
        task: nextTask,
        context: context.trim() || null,
        userId: user?.$id ?? null,
        workspaceId: currentOrg?.$id ?? null,
      });

      setAutomationRun(response);

      if (user?.$id && currentOrg?.$id) {
        const [runsResponse, remindersResponse] = await Promise.all([
          listAutomationRuns({ limit: 10, userId: user.$id, workspaceId: currentOrg.$id }),
          listAutomationReminders({ limit: 10, userId: user.$id, workspaceId: currentOrg.$id }),
        ]);

        setAutomationRuns(runsResponse.runs || []);
        setAutomationReminders(remindersResponse.reminders || []);
      }
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Failed to run automation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] xl:px-[16.66%] py-[10%] px-6 h-full mb-4">
      <div>
        <h1 className="font-medium md:text-[40px] text-[20px] bg-gradient-to-r bg-clip-text text-transparent from-black dark:from-white to-primary leading-[120%]">
          Automation
        </h1>
        <p className="text-gray-400 mt-2">
          Create automations to analyze your tasks and get insights, summaries, and next steps. You can also set reminders for follow-ups and deadlines.
        </p>
      </div>

      <div className="flex flex-col gap-2 p-4 rounded-[10px] border border-gray-500/[0.2] shadow-[0px_4px_12px_0px_#80808010]">
        <div className="flex gap-2 w-full">
          <div className="flex-1 relative">
            <textarea
              placeholder="Click recorder to start speaking or type your automation task here..."
              value={displayText}
              onChange={(e) => {
                setFinalText(e.target.value);
                setInterimText("");
              }}
              className="border-none w-full h-[100px] outline-none bg-transparent dark:text-white dark:placeholder-gray-400 resize-none"
            />
            <span className="absolute bottom-2 left-0 text-xs italic pointer-events-none px-1">
              {status === "recording"
                ? `Recording... (${Math.floor(recordingTime / 1000)}s)`
                : status === "Listening..."
                  ? "Processing audio..."
                  : status === "processing"
                    ? "Preparing automation..."
                    : ""}
            </span>
          </div>

          <div className="flex flex-col flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
              {isSupported && (
                <button
                  type="button"
                  onClick={handleMicToggle}
                  title={isRecording ? "Stop recording" : "Start recording"}
                  className={`p-4 rounded-full border transition-colors ${
                    isRecording
                      ? "bg-red-500 border-red-500 text-white animate-pulse"
                      : "border-border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-bg/50"
                  }`}
                >
                  {isRecording ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="3" y="3" width="10" height="10" rx="1" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm0 1a2 2 0 0 1 2 2v4a2 2 0 0 1-4 0V4a2 2 0 0 1 2-2z" />
                      <path d="M4.5 8a.5.5 0 0 0-1 0 4.5 4.5 0 0 0 9 0 .5.5 0 0 0-1 0A3.5 3.5 0 0 1 8 11.5 3.5 3.5 0 0 1 4.5 8z" />
                      <path d="M7.5 13v1.5h-2a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-2V13H7.5z" />
                    </svg>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload recorded file"
                disabled={isTranscribingFile || isRecording}
                className={`p-4 rounded-full border border-border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-bg/50 text-sm ${
                  isTranscribingFile || isRecording ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isTranscribingFile ? "Transcribing…" : <Upload size={16} />}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Context</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Optional extra context"
            className="w-full min-h-[88px] resize-none rounded-[10px] border border-gray-500/[0.15] bg-white dark:bg-dark-bg px-4 py-3 outline-none dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="flex justify-between flex-wrap gap-4 items-end">
          <p className="text-gray-400 text-sm">
            {userRole === "free" && (
              <Link to="/account/pricing" className="ml-2 text-primary text-xs">
                (Upgrade)
              </Link>
            )}
          </p>

          <Button className="max-[450px]:w-full" size="small" onClick={handleRunAutomation} disabled={loading || !displayText.trim()}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                Running…
              </>
            ) : (
              "Run automation"
            )}
          </Button>
        </div>
      </div>

      {displayError && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300">
          {displayError}
        </div>
      )}

      {automationRun && (
        <div className="rounded-[10px] border border-gray-500/[0.12] bg-white dark:bg-dark-bg p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold">Last run</span>
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
              {automationRun.status}
            </span>
          </div>
          {automationRun.analysis?.summary && (
            <p className="text-gray-600 dark:text-gray-300">{automationRun.analysis.summary as string}</p>
          )}
          {automationRun.analysis?.nextStep && (
            <p className="mt-2 text-xs text-gray-400">Next step: {automationRun.analysis.nextStep as string}</p>
          )}
        </div>
      )}

      {historyError && (
        <div className="rounded-[10px] border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {historyError}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[10px] border border-gray-500/[0.12] bg-white dark:bg-dark-bg p-4">
          <h3 className="font-semibold text-sm mb-3">Recent runs</h3>
          {historyLoading ? (
            <div className="text-sm text-gray-400">Loading recent runs…</div>
          ) : automationRuns.length > 0 ? (
            <div className="space-y-3">
              {automationRuns.map((run) => (
                <div key={run.$id} className="rounded-[10px] border border-gray-500/[0.08] bg-bg-gray-100/40 dark:bg-dark-bg/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1">{run.task}</p>
                    <span className="text-[11px] text-gray-400">{run.status}</span>
                  </div>
                  {run.summary && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{run.summary}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No automation runs yet.</p>
          )}
        </div>

        <div className="rounded-[10px] border border-gray-500/[0.12] bg-white dark:bg-dark-bg p-4">
          <h3 className="font-semibold text-sm mb-3">Reminders</h3>
          {historyLoading ? (
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
                  {reminder.dueAt && <p className="mt-1 text-[11px] text-gray-400">Due {new Date(reminder.dueAt).toLocaleString()}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No reminders scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AutomationPage;
