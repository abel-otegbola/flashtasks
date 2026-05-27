type CommentEntry = {
  author: string;
  email?: string;
  message: string;
  createdAt?: string;
};

export const parseComments = (comments: string): CommentEntry[] => {
  if (!comments || comments === "0") return [];

  try {
    const parsed = JSON.parse(comments) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry): entry is CommentEntry => Boolean(entry && typeof entry === 'object'))
      .map((entry) => ({
        author: String((entry as CommentEntry).author || 'Unknown'),
        email: (entry as CommentEntry).email ? String((entry as CommentEntry).email) : undefined,
        message: String((entry as CommentEntry).message || ''),
        createdAt: (entry as CommentEntry).createdAt ? String((entry as CommentEntry).createdAt) : undefined,
      }))
      .filter((entry) => entry.message.length > 0);
  } catch {
    return comments
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [authorPart, createdAtPart, ...messageParts] = entry.split("|");

        if (messageParts.length > 0) {
          return {
            author: authorPart || "Unknown",
            createdAt: createdAtPart,
            message: messageParts.join("|").trim(),
          };
        }

        return {
          author: "Legacy",
          message: entry,
        };
      });
  }
};