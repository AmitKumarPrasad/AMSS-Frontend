import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import { listAnnouncements, listDocuments, markAnnouncementRead } from "./selfService";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("self-service API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads published announcements", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { content: [{ id: "a1", title: "Holiday", body: "School closed." }] },
    } as never);

    const result = await listAnnouncements("school-1");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/communications/announcements",
      { params: { publishedOnly: true, page: 0, size: 20 } },
    );
    expect(result.content[0].title).toBe("Holiday");
  });

  it("marks an announcement as read", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({} as never);

    await markAnnouncementRead("school-1", "a1");

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/communications/announcements/a1/read",
    );
  });

  it("loads published documents", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [{ id: "d1", title: "Calendar", fileName: "calendar.pdf", contentType: "application/pdf" }],
    } as never);

    const result = await listDocuments("school-1");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/documents",
      { params: { publishedOnly: true, limit: 50 } },
    );
    expect(result[0].title).toBe("Calendar");
  });
});
