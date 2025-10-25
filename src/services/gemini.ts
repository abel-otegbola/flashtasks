import { todo } from "../interface/todo";

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Converts user input text into structured tasks using Google Gemini API
 * Returns null if the input is just generic conversation (hello, thanks, etc.)
 */
export async function convertTextToTasks(text: string, retries = 3): Promise<todo[] | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
      }

    const prompt = `You are an AI assistant that converts user input into actionable tasks. 

IMPORTANT RULES:
1. If the input is just a greeting (hello, hi, hey), generic conversation, or not task-related, return exactly: {"tasks": null}
2. Only create tasks if the input contains actionable items, work to be done, or to-do items
3. Extract multiple tasks if mentioned
4. Generate appropriate categories based on task type (e.g., "Development", "Design", "Marketing", "Personal", "Work", "Meeting")
5. Set realistic priorities based on urgency words (urgent=high, soon=medium, otherwise=low)
6. Set status as "pending" for new tasks
7. Generate IDs using timestamps

INPUT TEXT: "${text}"

Return a JSON object with this exact structure:
{
  "tasks": [
    {
      "id": "unique_id_here",
      "title": "Short task title",
      "description": "Detailed description",
      "category": "Appropriate category",
      "status": "pending",
      "priority": "low|medium|high",
      "dueDate": "YYYY-MM-DD format if mentioned, otherwise null",
      "$createdAt": "current ISO date",
      "comments": "0"
    }
  ]
}

If no actionable tasks detected, return: {"tasks": null}

Return ONLY valid JSON, no markdown, no explanation.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Failed to generate tasks';
        
        // Check if it's an overload error and we have retries left
        if (errorMessage.includes('overloaded') && attempt < retries) {
          lastError = new Error(errorMessage);
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Gemini API overloaded. Retrying in ${delay/1000}s... (Attempt ${attempt + 1}/${retries})`);
          await sleep(delay);
          continue; // Retry
        }
        
        throw new Error(errorMessage);
      }

      const data: GeminiResponse = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!generatedText) {
        throw new Error('No response from Gemini');
      }

      // Clean up the response - remove markdown code blocks if present
      let cleanedText = generatedText.trim();
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Parse JSON response
      const parsed = JSON.parse(cleanedText);
      
      // If Gemini determined this isn't a task, return null
      if (parsed.tasks === null) {
        return null;
      }

      // Validate and return tasks
      if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        // Get user from localStorage
        let userId = '';
        let userEmail = '';
        
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            // Handle both Appwrite session format ($id) and custom User interface (id)
            userId = user.$id || user.id || '';
            userEmail = user.email || '';
          }
        } catch (e) {
          console.error('Error reading user from localStorage:', e);
        }

        // Ensure each task has required fields
        const validTasks = parsed.tasks.map((task: any) => ({
          id: task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: task.title || 'Untitled Task',
          description: task.description || '',
          category: task.category || 'General',
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          dueDate: task.dueDate || undefined,
          $createdAt: task.$createdAt || new Date().toISOString(),
          comments: task.comments || '0',
          $updatedAt: new Date().toISOString(),
          userId: userId,
          userEmail: userEmail
        })) as todo[];

        return validTasks;
      }

      return null;
    } catch (error) {
      lastError = error as Error;
      
      // If it's the last attempt, throw the error
      if (attempt === retries) {
        console.error('Error converting text to tasks after all retries:', error);
        throw error;
      }
      
      // Otherwise, retry with exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Error occurred. Retrying in ${delay/1000}s... (Attempt ${attempt + 1}/${retries})`);
      await sleep(delay);
    }
  }

  // If we exhausted all retries
  throw lastError || new Error('Failed to convert text to tasks after multiple attempts');
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Convert audio blob to base64
  const toBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });

  const base64Data = await toBase64(audioBlob);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Transcribe this audio to text. Only return the transcribed text, nothing else." },
              { inline_data: { mime_type: (audioBlob as any).type || 'audio/webm', data: base64Data } }
            ]
          }
        ],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
      })
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to transcribe audio');
  }

  const data: any = await response.json();
  const transcribedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!transcribedText) throw new Error('No transcription returned from Gemini');
  return transcribedText;
}