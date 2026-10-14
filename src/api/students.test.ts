import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import { getStudents } from "./students";

vi.mock("./client", () => ({ apiClient: { get: vi.fn() } }));

describe("getStudents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the tenant-scoped backend endpoint and query contract", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { content: [{ id: "s1", name: "Asha" }], totalElements: 21, totalPages: 3, number: 1, size: 10 },
    } as never);
    const result = await getStudents("school-1", { page: 1, size: 10, status: "ACTIVE", search: "Asha" });
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/schools/school-1/students", {
      params: { page: 1, size: 10, status: "ACTIVE", q: "Asha" },
    });
    expect(result).toEqual({
      content: [{ id: "s1", name: "Asha" }],
      totalElements: 21,
      totalPages: 3,
      number: 1,
      size: 10,
    });
  });

  it("supports alternate list payloads and derives totals", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { items: [{ id: "s1" }, { id: "s2" }] } } as never);
    const result = await getStudents("school-1", { page: 0, size: 10 });
    expect(result).toEqual({
      content: [{ id: "s1" }, { id: "s2" }],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 10,
    });
  });
});
