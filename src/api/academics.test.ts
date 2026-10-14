import { describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import { listAcademicYears, listClasses, listSubjects, listSections, listTimetable } from "./academics";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("academics api", () => {
  it("loads section and timetable data from the school-scoped contracts", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { content: [] } } as never);
    await listSections("school-1", "class-1");
    await listTimetable("school-1", "section-1");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/schools/school-1/classes/class-1/sections", { params: { page: 0, size: 100, status: "ACTIVE" } });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/schools/school-1/timetable/sections/section-1", { params: { page: 0, size: 100 } });
  });
  it("lists academic years", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { content: [] } } as never);
    await listAcademicYears("school-1");
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/academic-years",
      { params: { page: 0, size: 50 } },
    );
  });

  it("lists classes for an academic year", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { content: [] } } as never);
    await listClasses("school-1", "year-1");
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/classes",
      { params: { academicYearId: "year-1", page: 0, size: 50 } },
    );
  });

  it("lists subjects with an optional search", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { content: [] } } as never);
    await listSubjects("school-1", "math");
    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/schools/school-1/academics/subjects",
      { params: { q: "math", page: 0, size: 50 } },
    );
  });
});
