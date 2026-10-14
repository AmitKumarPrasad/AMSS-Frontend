import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import { listAcademicYears, createAssessment, saveResults, listEnrolledStudents } from "./assessments";

vi.mock("./client", () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));

describe("assessments API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads active academic years", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { content: [{ id: "y1", code: "2026", name: "2026-27" }] } } as never);
    const result = await listAcademicYears("school-1");
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/schools/school-1/academic-years", { params: { status: "ACTIVE", page: 0, size: 50 } });
    expect(result[0].id).toBe("y1");
  });

  it("creates an assessment", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: "a1", name: "Mid Term" } } as never);
    const result = await createAssessment("school-1", { academicYearId: "y1", classId: "c1", name: "Mid Term", assessmentDate: "2026-09-22", maxMarks: 100 });
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/schools/school-1/assessments", { academicYearId: "y1", classId: "c1", name: "Mid Term", assessmentDate: "2026-09-22", maxMarks: 100 });
    expect(result.id).toBe("a1");
  });

  it("saves bulk results", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: [{ id: "r1", studentId: "s1", marks: 88, grade: "A" }] } as never);
    const result = await saveResults("school-1", "a1", [{ studentId: "s1", marks: 88, grade: "A" }]);
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/schools/school-1/assessments/a1/results/bulk", { entries: [{ studentId: "s1", marks: 88, grade: "A" }] });
    expect(result[0].grade).toBe("A");
  });
});

describe("class enrollment for grading",()=>{
 beforeEach(()=>vi.clearAllMocks());
 it("includes only active enrolled students across pages",async()=>{
  const get=vi.mocked(apiClient.get);
  get.mockResolvedValueOnce({data:{content:[{id:"section-a"}]}} as never);
  get.mockResolvedValueOnce({data:{content:[{studentId:"a",status:"ACTIVE"},{studentId:"b",status:"INACTIVE"}],totalPages:2}} as never);
  get.mockResolvedValueOnce({data:{content:[{studentId:"c",status:"ACTIVE"}],totalPages:2}} as never);
  get.mockResolvedValueOnce({data:{content:[{id:"a"},{id:"b"}],totalPages:2}} as never);
  get.mockResolvedValueOnce({data:{content:[{id:"c"}],totalPages:2}} as never);
  expect((await listEnrolledStudents("school-1","class-1")).map(s=>s.id)).toEqual(["a","c"]);
 });
 it("does not load school-wide students when no section exists",async()=>{
  vi.mocked(apiClient.get).mockResolvedValueOnce({data:{content:[]}} as never);
  expect(await listEnrolledStudents("school-1","class-1")).toEqual([]);
  expect(apiClient.get).toHaveBeenCalledTimes(1);
 });
});
