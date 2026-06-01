export async function transcribeFile(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error("Missing transcription API key.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "model",
    (import.meta.env.VITE_GROQ_TRANSCRIPTION_MODEL as string | undefined) || "whisper-large-v3"
  );
  formData.append("response_format", "json");

  return fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  })
    .then(async (res) => {
      if (!res.ok) {
        const message = await res.text().catch(() => "");
        throw new Error(message || "Failed to transcribe file.");
      }

      return res.json();
    })
    .then((data: { text?: string }) => data.text?.trim() || "");
}
