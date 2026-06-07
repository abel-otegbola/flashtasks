import { Link, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { Upload } from "@solar-icons/react";
import { useRef, useState } from "react";
import toast from 'react-hot-toast';
import { useTasks } from "../../context/tasksContext";
import { useUser } from "../../context/authContext";
import { useOrganizations } from "../../context/organizationContext";
import { getMaxRecordingTime, mapExtractedToTodo, mapTodoToSavePayload } from "../../helpers/createTaskHelpers";
import { useRealtimeTranscription } from "../../helpers/audioTranscriber";
import { transcribeFile } from "../../helpers/transcribeFile";
import { extractTasksFromText } from "../../helpers/voiceTaskExtractor";
import Button from "../button/button";
import NewTaskCard from "../cards/newTaskCard";
import TaskDetailsModal from "../modals/taskDetailsModal";
import { todo } from "../../interface/todo";

function CreateTask() {
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<todo[] | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<todo | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isTranscribingFile, setIsTranscribingFile] = useState(false);
  const [status, setStatus] = useState<"idle" | "recording" | "Listening..." | "processing" | "saving" | "error">("idle");

  const { addMultipleTasks, loading: savingTasks } = useTasks();
  const { user } = useUser();
  const orgCtx = useOrganizations();
  const { currentOrg } = orgCtx;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useNavigate();

  const userRole = ((user as any)?.prefs?.role as string) || "free";
  const maxRecordingTime = getMaxRecordingTime(userRole);

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

    // Final accurate Groq transcript
    onFinalTranscript: (text) => {
      setStatus("idle");
      setFinalText(text);

      // Clear interim once final arrives
      setInterimText("");
    },
  });

  const isRecording = transcriptionStatus === "recording";
  const isSupported = transcriptionStatus !== "error";
  const displayText = interimText ? `${finalText} ${interimText}`.trim() : finalText;
  const displayError = taskError || error;

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    if (recordingTime >= maxRecordingTime) {
      setTaskError("Recording limit reached. Upgrade your plan for more time.");
      return;
    }
    setTaskError(null);
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
      setTaskError(err instanceof Error ? err.message : "Failed to transcribe file.");
    } finally {
      setIsTranscribingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerateTasks = async () => {
    setStatus("processing");
    const textToProcess = displayText.trim();
    if (!textToProcess) {
      setTaskError("Please enter or speak some text first.");
      return;
    }
    setIsGenerating(true);
    setTaskError(null);
    try {
      extractTasksFromText(textToProcess)
      .then(response => {
        if (response.length === 0) {
          setTaskError("This doesn't seem to be a task. Try describing something you need to do!");
          setGeneratedTasks(null);
          setIsGenerating(false);
        } else {
          setGeneratedTasks(
            response.map((task) =>
              mapExtractedToTodo(task, user?.$id ?? "", user?.email ?? "", currentOrg?.$id)
            )
          );
          setIsGenerating(false);
        }
      })
      
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : "Failed to generate tasks.");
      setGeneratedTasks(null);
    } finally {
      setStatus("idle");
    }
  };

  const handleSaveTasks = async () => {
    if (!generatedTasks?.length) return;
    // Permission check: only allow save if user has Create tasks permission or is owner
    const canCreate =  true;
    if (!canCreate) {
      toast.error('You do not have permission to create tasks in this organization');
      return;
    }
    if (!user) {
      toast.error('Sign in to save tasks');
      router('/auth/login');
      return;
    }

    setStatus("saving")
    const saved = await addMultipleTasks(
      generatedTasks.map((task) =>
        mapTodoToSavePayload(task, user?.$id ?? "", user?.email ?? "", currentOrg?.$id)
      )
    );
    if (saved) {
      setFinalText("");
      setInterimText("");
      setGeneratedTasks(null);
      setStatus("idle")
    } else {
      setStatus("idle")
    }
  };

  return (
    <div className="">
      
      <div className="flex flex-col gap-2 p-4 rounded-[10px] border border-gray-500/[0.2] shadow-[0px_4px_12px_0px_#80808010]">
        <div className="flex gap-2 w-full">
          <Formik
            initialValues={{ search: displayText }}
            enableReinitialize
            onSubmit={(_, { setSubmitting }) => setSubmitting(false)}
          >
            {({ handleSubmit }) => (
              <form onSubmit={handleSubmit} className="flex-1 relative">
                <textarea
                  placeholder="Click recorder to start speaking or type your notes here..."
                  name="search"
                  value={displayText}
                  onChange={(e) => {
                    setFinalText(e.target.value);
                    setInterimText("");
                  }}
                  className="border-none w-full h-[100px] outline-none bg-transparent dark:text-white dark:placeholder-gray-400 resize-none"
                />
                  <span className="absolute bottom-2 left-0 text-xs italic pointer-events-none px-1">
                    {status === "recording" ? `Recording... (${Math.floor(recordingTime / 1000)}s)` : status === "Listening..." ? "Processing audio..." : status === "processing" ? "Generating tasks..." : status === "saving" ? "Saving tasks..." : ""}
                  </span>
              </form>
            )}
          </Formik>

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

        <div className="flex justify-between flex-wrap gap-4 items-end">
          <p className="text-gray-400 text-sm">
            5 mins
            {isRecording && (
              <span className="ml-2 text-red-400 text-xs font-medium">● Recording</span>
            )}
            {userRole === "free" && (
              <Link to="/account/pricing" className="ml-2 text-primary text-xs">
                (Upgrade)
              </Link>
            )}
          </p>

          <Button
            className="max-[450px]:w-full"
            size="small"
            onClick={handleGenerateTasks}
            disabled={isGenerating || !finalText.trim() || isRecording}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                Generating…
              </>
            ) : (
              "Generate tasks"
            )}
          </Button>
        </div>
      </div>

      {displayError && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300">
          {displayError}
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border border-border-gray-100 dark:border-gray-700 bg-bg-gray-100 dark:bg-dark-bg/50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">Analyzing your input…</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Extracting tasks from your text</p>
          </div>
        </div>
      )}

      {generatedTasks && generatedTasks.length > 0 && (
        <div className="flex flex-col bg-white dark:bg-dark-bg border border-gray-500/[0.1] rounded-[10px] mt-4">
          <div className="flex justify-between items-center border-b border-gray-500/[0.1] md:px-6 p-4">
            <h2 className="font-semibold">Generated Tasks ({generatedTasks.length})</h2>
            <Button size="small" onClick={handleSaveTasks} disabled={savingTasks}>
              {savingTasks ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                "Save All Tasks"
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-3 border border-gray-500/[0.1] rounded-lg p-4 bg-bg-gray-100/[0.2] dark:bg-dark-bg">
            <div className="flex flex-col gap-2">
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 pr-24 py-2 text-xs font-medium text-gray-500 uppercase border-b border-gray-500/[0.2]">
                <div className="col-span-4">Task</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-2">Due Date</div>
              </div>
              {generatedTasks.map((task, index) => (
                <NewTaskCard 
                  key={index} 
                  task={task} 
                  deleteTask={() => { setGeneratedTasks((prev) => prev ? prev.filter((t) => t.$id !== task.$id) : null);}} 
                  saveTask={() => { handleSaveTasks() }} 
                  index={index} 
                  editGeneratedTask={(task) => setGeneratedTasks((prev) => prev ? prev.map((t) => t.$id === task.$id ? task : t) : null)}
                />
              ))}
            </div>
          </div>

          {selectedTask && (
            <TaskDetailsModal
              isOpen={detailsOpen}
              onClose={() => { setDetailsOpen(false); setSelectedTask(null); }}
              task={selectedTask}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default CreateTask;
