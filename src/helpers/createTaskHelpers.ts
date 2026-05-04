
import { todo } from "../interface/todo";
import { ExtractedTask } from "./voiceTaskExtractor";

export function mapExtractedToTodo(
  task: ExtractedTask,
  userId: string,
  userEmail: string,
  organizationId: string | undefined
): todo {
  return {
    $id: task.id,
    id: task.id,
    title: task.title,
    description: task.description || task.originalText,
    comments: "0",
    category: task.tags?.[0] || "General",
    userId,
    userEmail,
    status: "pending",
    priority: task.priority,
    dueDate: task.date ? task.date.toISOString().split("T")[0] : undefined,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    organizationId,
  };
}

export function mapTodoToSavePayload(
  task: todo,
  userId: string,
  userEmail: string,
  organizationId: string | undefined
) {
  return {
    title: task.title,
    userId,
    userEmail,
    description: task.description,
    category: task.category,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    comments: task.comments || "0",
    organizationId,
  };
}

export function formatRecordingTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function formatRecordingLimit(userRole: string, maxSeconds: number): string {
  if (userRole === "enterprise") return "∞";
  return `${Math.floor(maxSeconds / 60)}:00`;
}

export function getMaxRecordingTime(userRole: string): number {
  if (userRole === "enterprise") return Infinity;
  if (userRole === "pro") return 1800;
  return 300;
}