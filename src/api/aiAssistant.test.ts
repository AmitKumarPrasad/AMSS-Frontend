import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import {
  askAssistant,
  createConversation,
  deleteConversation,
  getConversation,
  getSchoolIdFromToken,
  listConversations,
} from "./aiAssistant";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("AI assistant API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists conversations with the requested limit", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [{ id: "c1", title: "Test", createdAt: "a", updatedAt: "b" }] } as never);

    const result = await listConversations("school-1", 25);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/ai/conversations",
      { params: { limit: 25 } },
    );
    expect(result[0].id).toBe("c1");
  });

  it("creates and loads a conversation", async () => {
    const conversation = { id: "c1", title: "Test", createdAt: "a", updatedAt: "b", messages: [] };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: conversation } as never);
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: conversation } as never);

    await createConversation("school-1", "Test");
    const result = await getConversation("school-1", "c1");

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/ai/conversations",
      { title: "Test" },
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/ai/conversations/c1",
    );
    expect(result).toEqual(conversation);
  });

  it("deletes a conversation", async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({} as never);

    await deleteConversation("school-1", "c1");

    expect(apiClient.delete).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/ai/conversations/c1",
    );
  });

  it("sends an assistant question with conversation state and request id", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("123e4567-e89b-12d3-a456-426614174000");
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { answer: "Hello", conversationId: "c1" },
    } as never);

    const result = await askAssistant("school-1", "How many students?", "c1");

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/ai/ask",
      { question: "How many students?", conversationId: "c1" },
      { headers: { "X-Request-ID": "123e4567-e89b-12d3-a456-426614174000" } },
    );
    expect(result.answer).toBe("Hello");
  });

  it("extracts school_id from a JWT payload", () => {
    const payload = btoa(JSON.stringify({ school_id: "school-42" }))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const token = `header.${payload}.signature`;

    expect(getSchoolIdFromToken(token)).toBe("school-42");
  });

  it("returns null for malformed or missing JWT claims", () => {
    expect(getSchoolIdFromToken(null)).toBeNull();
    expect(getSchoolIdFromToken("not-a-jwt")).toBeNull();

    const payload = btoa(JSON.stringify({ sub: "user-1" })).replace(/=/g, "");
    expect(getSchoolIdFromToken(`header.${payload}.signature`)).toBeNull();
  });
});
