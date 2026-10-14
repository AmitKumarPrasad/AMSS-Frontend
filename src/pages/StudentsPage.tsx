import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getApiErrorInfo } from "../api/errorHandling";
import { getStudents } from "../api/students";
import { useAuthStore } from "../auth/authStore";

const PAGE_SIZE = 20;

export default function StudentsPage() {
  const schoolId = useAuthStore((state) => state.user?.schoolId);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("ACTIVE");
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["students", schoolId, page, status, search],
    enabled: Boolean(schoolId),
    queryFn: () => getStudents(schoolId!, { page, size: PAGE_SIZE, status, search }),
  });

  const students = query.data?.content ?? [];
  const totalPages = Math.max(1, query.data?.totalPages ?? 1);
  const errorMessage = !schoolId ? "Your session does not contain a school identifier." : query.isError ? getApiErrorInfo(query.error).message : "";

  function updateSearch(value: string) {
    setPage(0);
    setSearch(value);
  }

  function updateStatus(value: string) {
    setPage(0);
    setStatus(value);
  }

  return (
    <section className="page-section" aria-labelledby="students-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · Student Management</p>
          <h1 id="students-title">Students</h1>
          <p className="subtitle">Search, filter and review students within your school.</p>
        </div>
      </div>

      <div className="toolbar">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Name or admission number"
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => updateStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
      </div>

      {query.isLoading && <p className="state-message">Loading students…</p>}
      {errorMessage && (
        <div className="state-message error" role="alert">
          <p>{errorMessage}</p>
          {schoolId && <button type="button" onClick={() => query.refetch()} disabled={query.isFetching}>
            {query.isFetching ? "Retrying…" : "Retry"}
          </button>}
        </div>
      )}

      {schoolId && !query.isLoading && !query.isError && (
        <>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Admission No.</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.admissionNumber ?? "—"}</td>
                    <td>{student.name ?? ([student.firstName, student.lastName].filter(Boolean).join(" ") || "—")}</td>
                    <td>{[student.className, student.sectionName].filter(Boolean).join(" / ") || "—"}</td>
                    <td>{student.email ?? "—"}</td>
                    <td><span className="badge">{student.status ?? "—"}</span></td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-cell">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination" aria-label="Student pagination">
            <button type="button" disabled={page === 0 || query.isFetching} onClick={() => setPage((value) => value - 1)}>
              Previous
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button type="button" disabled={page + 1 >= totalPages || query.isFetching} onClick={() => setPage((value) => value + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
