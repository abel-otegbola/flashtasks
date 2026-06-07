import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Button from "../../../components/button/button";
import { Upload } from "@solar-icons/react";
import { useOrganizations } from "../../../context/organizationContext";
import { useUser } from "../../../context/authContext";
import { useRealtimeTranscription } from "../../../helpers/audioTranscriber";
import { transcribeFile } from "../../../helpers/transcribeFile";
import { useAutomations } from "../../../context/automationContext";
import { extractAutomationFromText } from "../../../helpers/textToAutomation";
import { Automation } from "../../../interface/automation";
import TagInput from "../../../components/input/tagInput";
import { TrashIcon } from "@phosphor-icons/react";

function CreateAutomationPage() {
  const { user } = useUser();
  const { currentOrg, invitedMembers, getAllInvitedMembers } = useOrganizations();
  const { createAutomation, loading } = useAutomations();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isTranscribingFile, setIsTranscribingFile] = useState(false);
  const [status, setStatus] = useState<"idle" | "recording" | "Listening..." | "processing" | "error">("idle");
  const [automation, setAutomation] = useState<Automation | null>(null);

  const userRole = ((user as any)?.prefs?.role as string) || "free";

  useEffect(() => {
    if (currentOrg) {
      getAllInvitedMembers(currentOrg.$id);
    }
  }, [currentOrg]);

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

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
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
      console.error(err instanceof Error ? err.message : "Failed to transcribe file.");
    } finally {
      setIsTranscribingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateAutomation = async () => {
    if (!displayText.trim()) return;
    setStatus("processing");
    const automation = await extractAutomationFromText(
      displayText.trim(),
      {
        userId: user!.$id,
        teamId: currentOrg?.$id || "",
        teamMembers: invitedMembers.map((m) => m.$id),
      }
    )
    .then((automation) => {      
      if (!automation) {
        throw new Error("Failed to parse automation from text.");
      }
      setAutomation(automation);
    })
    .catch((err) => {
      console.error(err instanceof Error ? err.message : "Failed to create automation.");
      setStatus("error");
    });
  };

  const handleSaveAutomation = async () => {
    if (!automation) return;
    try {
      await createAutomation(automation);
      setStatus("idle");
      setFinalText("");
      setAutomation(null);
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Failed to save automation.");
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] xl:px-[16.66%] py-[10%] px-6 h-full mb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/account/automations" className="text-xs font-medium text-gray-400 hover:text-primary">
            Back to automations
          </Link>
          <h1 className="font-medium md:text-[40px] text-[20px] bg-gradient-to-r bg-clip-text text-transparent from-black dark:from-white to-primary leading-[120%] mt-2">
            Create automation
          </h1>
          <p className="text-gray-400 mt-2">
            Describe the workflow you want, record or upload audio to generate the automation.
          </p>
        </div>
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

        <div className="flex justify-between flex-wrap gap-4 items-end">
          <p className="text-gray-400 text-sm">
            {userRole === "free" && (
              <Link to="/account/pricing" className="ml-2 text-primary text-xs">
                (Upgrade)
              </Link>
            )}
          </p>

          <Button className="max-[450px]:w-full" size="small" onClick={handleCreateAutomation} disabled={loading || !displayText.trim()}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                Creating…
              </>
            ) : (
              "Create automation"
            )}
          </Button>
        </div>
      </div>

      {automation && (
        <div className="flex flex-col gap-4 p-4 rounded-[10px] border border-green-500/[0.2] text-sm">
          <div className="flex items-center justify-between gap-2">
            <p><strong>Title:</strong> {automation.title}</p>
            <button onClick={() => setAutomation(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <TrashIcon size={16} />
            </button>
          </div>
          <p><strong>Instruction:</strong> {automation.instruction}</p>
          <p><strong>Actions:</strong> {automation.actions?.length || 0}</p>
          <div className="flex flex-wrap gap-2">
            <TagInput readonly tags={automation.actions?.map((a) => a.type) || []} onChange={(tags) => setAutomation({...automation, actions: automation.actions?.filter(action => tags.includes(action.type))})} />
          </div>
          <div className="flex justify-end">
            <Button size="small" variant="primary" onClick={handleSaveAutomation} disabled={loading}>
              {loading ? "Saving…" : "Save automation"}
            </Button> 
          </div>
        </div>
      )}
    </div> 
  );
}

export default CreateAutomationPage;
