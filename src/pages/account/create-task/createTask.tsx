import { Link } from "react-router-dom"
import Input from "../../../components/input/input"
import { Formik } from "formik";
import Button from "../../../components/button/button";
import { ArrowRight } from "@solar-icons/react";
import VoiceInput from "../../../components/voiceInput/voiceInput";
import { useRef, useState } from "react";
import { convertTextToTasks, transcribeAudio } from "../../../services/gemini";
import { todo } from "../../../interface/todo";
import { useOrganizations } from '../../../context/organizationContext';
import { useTasks } from "../../../context/tasksContext";
import { useUser } from "../../../context/authContext";

function CreateTask() {
  const [inputText, setInputText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState<todo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { addMultipleTasks, loading: savingTasks } = useTasks()
  const { user } = useUser();
  const { currentOrg } = useOrganizations();

  const handleTranscript = (text: string) => {
    // Append the transcribed text to existing text
    setInputText(prev => prev ? `${prev} ${text}` : text)
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const text = await transcribeAudio(file);
      handleTranscript(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transcribe uploaded audio');
    } finally {
      setIsUploading(false);
      // reset input so same file can be uploaded again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const handleGenerateTasks = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text first");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const tasks = await convertTextToTasks(inputText);
      
      if (tasks === null) {
        setError("This doesn't seem to be a task. Try describing something you need to do!");
        setGeneratedTasks(null);
      } else {
        setGeneratedTasks(tasks);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate tasks");
      setGeneratedTasks(null);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleSaveTasks = async () => {
    if (!generatedTasks || generatedTasks.length === 0) return;
    
    const tasksToSave = generatedTasks.map(task => ({
      title: task.title,
      userId: user?.$id as string || "",
      userEmail: user?.email || "",
      description: task.description,
      category: task.category,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      comments: task.comments || '0'
      ,organizationId: currentOrg?.$id || undefined
    }));

    const savedTasks = await addMultipleTasks(tasksToSave);
    
    if (savedTasks) {
      // Clear the form after successful save
      setInputText("");
      setGeneratedTasks(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] md:px-[16.66%] py-[10%] px-6 h-full mb-4">
      <h1 className="font-medium md:text-[40px] text-[20px] bg-gradient-to-r bg-clip-text text-transparent from-black dark:from-white to-primary leading-[120%]">
        Hi there, {user?.name}<br />
        What do you want to do today?
      </h1>

      <div className="flex justify-between gap-4">
        <p className="text-gray-400">Continue from where you stopped yesterday and add today's tasks</p>
        <Link to={"tasks"} className="text-primary">View all</Link>
      </div>

      <div className="flex flex-col gap-2 p-4 rounded-[10px] border border-border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-dark-bg-secondary/50">
        <div className="flex gap-2 w-full">
          <Formik
                initialValues={{ search: inputText }}
                enableReinitialize
                onSubmit={(values, { setSubmitting }) => {
                    console.log(values)
                    setSubmitting(false);
                }}
            >
                {({ values, handleChange, handleSubmit }) => (
                <form onSubmit={handleSubmit} className="flex-1">
                    <textarea 
                      placeholder="Start speaking or writing..." 
                      onChange={(e) => {
                        handleChange(e)
                        setInputText(e.target.value)
                      }}
                      className="border-none w-full h-[100px] outline-none bg-transparent dark:text-white dark:placeholder-gray-400 resize-none" 
                      name="search" 
                      value={inputText} 
                    />
                </form>
                )
            }
            </Formik>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <VoiceInput onTranscript={handleTranscript} />
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className={`px-3 py-2 rounded-md border border-border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-bg-secondary/50 text-sm ${isUploading ? 'opacity-60' : ''}`}
              >
                {isUploading ? 'Transcribing...' : 'Upload audio'}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        <div className="flex justify-between items-end">
          <p className="text-gray-400 text-sm">{inputText.length}/1000</p>
          <Button 
            className="rounded-full" 
            size="small"
            onClick={handleGenerateTasks}
            disabled={isGenerating || !inputText.trim()}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate tasks
                <span className="bg-white rounded-full p-2 text-primary md:-mr-2 -mr-1"><ArrowRight color="currentColor" size={12}/></span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border border-border-gray-100 dark:border-gray-700 bg-bg-gray-100 dark:bg-dark-bg-secondary/50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">Analyzing your input...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI is creating your tasks</p>
          </div>
        </div>
      )}

      {/* Generated Tasks */}
      {generatedTasks && generatedTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[20px] font-bold">Generated Tasks ({generatedTasks.length})</h2>
            <Button 
              size="small"
              onClick={handleSaveTasks}
              disabled={savingTasks}
            >
              {savingTasks ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save All Tasks'
              )}
            </Button>
          </div>
          
          {generatedTasks.map((task, index) => (
            <div 
              key={task.$id || task.id || index} 
              className="p-4 rounded-lg border border-border-gray-100 dark:border-gray-700 bg-bg-gray-100 dark:bg-dark-bg-secondary/50 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[16px]">{task.title}</h3>
                <div className="flex gap-2">
                  {task.priority && (
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                    {task.category}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-[14px] mb-2">{task.description}</p>
              {task.dueDate && (
                <p className="text-[12px] text-gray-500 dark:text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CreateTask