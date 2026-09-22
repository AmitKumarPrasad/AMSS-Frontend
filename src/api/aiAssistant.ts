import { apiClient } from "./client";

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface ConversationView extends ConversationSummary {
  messages: ConversationMessage[];
}

export interface AssistantEvidence {
  [key: string]: unknown;
}

export interface AssistantResponse {
  answer?: string | null;
  evidence?: AssistantEvidence[];
  conversationId?: string | null;
}

export async function listConversations(schoolId: string, limit = 50) {
  const response = await apiClient.get<ConversationSummary[]>(
    `/api/v1/schools/${schoolId}/ai/conversations`,
    { params: { limit } }
  );
  return response.data;
}

export async function createConversation(schoolId: string, title?: string) {
  const response = await apiClient.post<ConversationView>(
    `/api/v1/schools/${schoolId}/ai/conversations`,
    title ? { title } : {}
  );
  return response.data;
}

export async function getConversation(schoolId: string, conversationId: string) {
  const response = await apiClient.get<ConversationView>(
    `/api/v1/schools/${schoolId}/ai/conversations/${conversationId}`
  );
  return response.data;
}

export async function deleteConversation(schoolId: string, conversationId: string) {
  await apiClient.delete(
    `/api/v1/schools/${schoolId}/ai/conversations/${conversationId}`
  );
}

export async function askAssistant(
  schoolId: string,
  question: string,
  conversationId?: string
) {
  const response = await apiClient.post<AssistantResponse>(
    `/api/v1/schools/${schoolId}/ai/ask`,
    { question, ...(conversationId ? { conversationId } : {}) },
    { headers: { "X-Request-ID": crypto.randomUUID() } }
  );
  return response.data;
}

export function getSchoolIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const claims = JSON.parse(atob(padded)) as { school_id?: string };
    return typeof claims.school_id === "string" ? claims.school_id : null;
  } catch {
    return null;
  }
}
