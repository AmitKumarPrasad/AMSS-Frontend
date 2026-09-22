import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../auth/authStore";
import {
  askAssistant,
  createConversation,
  deleteConversation,
  getConversation,
  getSchoolIdFromToken,
  listConversations,
  type ConversationMessage,
  type ConversationSummary,
} from "../api/aiAssistant";

function messageTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export default function AiAssistantPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const schoolId = useMemo(() => getSchoolIdFromToken(accessToken), [accessToken]);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshConversations(selectFirst = true) {
    if (!schoolId) {
      setLoading(false);
      setError("Your session does not contain a school identifier.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await listConversations(schoolId);
      setConversations(result);
      if (selectFirst && result.length > 0) {
        setSelectedId(result[0].id);
        const detail = await getConversation(schoolId, result[0].id);
        setMessages(detail.messages);
      } else if (result.length === 0) {
        setSelectedId(null);
        setMessages([]);
      }
    } catch {
      setError("Unable to load AI conversations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshConversations();
  }, [schoolId]);

  async function selectConversation(id: string) {
    if (!schoolId) return;
    setSelectedId(id);
    setError(null);
    try {
      const detail = await getConversation(schoolId, id);
      setMessages(detail.messages);
    } catch {
      setError("Unable to load this conversation.");
    }
  }

  async function startConversation() {
    if (!schoolId) return;
    setError(null);
    try {
      const conversation = await createConversation(schoolId);
      setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
      setSelectedId(conversation.id);
      setMessages([]);
    } catch {
      setError("Unable to create a conversation.");
    }
  }

  async function removeConversation() {
    if (!schoolId || !selectedId) return;
    setError(null);
    try {
      await deleteConversation(schoolId, selectedId);
      await refreshConversations();
    } catch {
      setError("Unable to delete this conversation.");
    }
  }

  async function sendQuestion() {
    const trimmed = question.trim();
    if (!schoolId || !trimmed || sending) return;

    const localUserMessage: ConversationMessage = {
      id: `local-user-${Date.now()}`,
      role: "USER",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setQuestion("");
    setError(null);
    setSending(true);
    setMessages((current) => [...current, localUserMessage]);

    try {
      let conversationId = selectedId;
      if (!conversationId) {
        const conversation = await createConversation(schoolId, trimmed.slice(0, 80));
        conversationId = conversation.id;
        setSelectedId(conversationId);
        setConversations((current) => [conversation, ...current]);
      }

      const result = await askAssistant(schoolId, trimmed, conversationId);
      const assistantMessage: ConversationMessage = {
        id: `local-assistant-${Date.now()}`,
        role: "ASSISTANT",
        content: result.answer?.trim() || "The assistant returned no answer.",
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, assistantMessage]);

      const updatedId = result.conversationId ?? conversationId;
      if (updatedId) {
        const detail = await getConversation(schoolId, updatedId);
        setSelectedId(updatedId);
        setMessages(detail.messages);
        setConversations((current) =>
          current.map((item) => item.id === updatedId ? {
            ...item,
            title: detail.title,
            updatedAt: detail.updatedAt,
          } : item)
        );
      }
    } catch {
      setError("Unable to get an AI response. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <section className="page-section"><p className="state-message">Loading AI Assistant…</p></section>;
  }

  return (
    <section className="page-section ai-page" aria-labelledby="ai-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · AI</p>
          <h1 id="ai-title">AI Assistant</h1>
          <p className="subtitle">Ask questions using your school context and continue conversations with persistent history.</p>
        </div>
      </div>

      {error && <p className="state-message error" role="alert">{error}</p>}

      <div className="ai-layout">
        <aside className="ai-sidebar" aria-label="Conversations">
          <button type="button" className="primary-button" onClick={() => void startConversation()}>+ New conversation</button>
          {conversations.length === 0 ? (
            <p className="state-message">No conversations yet.</p>
          ) : (
            <div className="conversation-list">
              {conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={conversation.id === selectedId ? "conversation-item active" : "conversation-item"}
                  onClick={() => void selectConversation(conversation.id)}
                >
                  <strong>{conversation.title}</strong>
                  <span>{messageTime(conversation.updatedAt)}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="ai-chat">
          <div className="chat-header">
            <div>
              <strong>{conversations.find((item) => item.id === selectedId)?.title ?? "New conversation"}</strong>
              <span>Persistent, tenant-scoped conversation history</span>
            </div>
            {selectedId && <button type="button" className="secondary-button" onClick={() => void removeConversation()}>Delete</button>}
          </div>

          <div className="message-list" aria-live="polite">
            {messages.length === 0 ? (
              <p className="state-message">Start a conversation by asking a school-management question.</p>
            ) : messages.map((message) => (
              <article key={message.id} className={message.role === "USER" ? "chat-message user" : "chat-message assistant"}>
                <div className="chat-message-role">{message.role === "USER" ? "You" : "AI Assistant"}</div>
                <p>{message.content}</p>
                <small>{messageTime(message.createdAt)}</small>
              </article>
            ))}
            {sending && <p className="state-message">AI Assistant is thinking…</p>}
          </div>

          <form className="ai-composer" onSubmit={(event) => { event.preventDefault(); void sendQuestion(); }}>
            <textarea
              value={question}
              maxLength={2000}
              rows={3}
              placeholder="Ask about students, academics, fees, attendance, or school operations…"
              onChange={(event) => setQuestion(event.target.value)}
              disabled={sending || !schoolId}
            />
            <div>
              <span>{question.length}/2000</span>
              <button type="submit" className="primary-button" disabled={sending || !question.trim() || !schoolId}>
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
