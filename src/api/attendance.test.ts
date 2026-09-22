import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import { getDailySummary, markBulkAttendance } from "./attendance";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("attendance API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads a daily summary", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { date: "2026-09-22", recorded: 10, present: 8, absent: 1, late: 1, excused: 0 },
    } as never);

    const result = await getDailySummary("school-1", "2026-09-22");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/attendance/summary",
      { params: { date: "2026-09-22" } },
    );
    expect(result.present).toBe(8);
  });

  it("marks attendance in bulk", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: [{ id: "a1", studentId: "s1", status: "PRESENT" }],
    } as never);

    const result = await markBulkAttendance("school-1", "2026-09-22", [
      { studentId: "s1", status: "PRESENT" },
    ]);

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/attendance/students/bulk",
      {
        attendanceDate: "2026-09-22",
        entries: [{ studentId: "s1", status: "PRESENT" }],
      },
    );
    expect(result[0].status).toBe("PRESENT");
  });
});
