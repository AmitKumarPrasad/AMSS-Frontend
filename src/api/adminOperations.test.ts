import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import { getDashboardSummary, listAuditEvents } from "./adminOperations";

vi.mock("./client", () => ({
  apiClient: { get: vi.fn() },
}));

describe("admin operations API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the operations dashboard", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { activeStudents: 120, activeStaff: 15, attendanceRateToday: 94.5, outstandingFees: 125000 },
    } as never);

    const result = await getDashboardSummary("school-1");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/operations/dashboard",
    );
    expect(result.activeStudents).toBe(120);
  });

  it("loads recent audit events", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [{ id: "event-1", eventType: "STUDENT_CREATED", createdAt: "2026-09-22T10:00:00Z" }],
    } as never);

    const result = await listAuditEvents("school-1", 25);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/operations/audit",
      { params: { limit: 25 } },
    );
    expect(result[0].eventType).toBe("STUDENT_CREATED");
  });
});
