import { useEffect, useMemo, useState } from "react";
import { getStudents, type Student } from "../api/students";
import { getApiErrorInfo } from "../api/errorHandling";
import {
  getDailySummary,
  markBulkAttendance,
  type AttendanceStatus,
  type DailySummary,
} from "../api/attendance";
import { getSchoolIdFromToken } from "../api/aiAssistant";
import { useAuthStore } from "../auth/authStore";

const STATUSES: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function studentName(student: Student) {
  return student.name ?? ([student.firstName, student.lastName].filter(Boolean).join(" ") || String(student.id));
}

export default function AttendancePage() {
  const token = useAuthStore((state) => state.accessToken);
  const schoolId = useMemo(() => getSchoolIdFromToken(token), [token]);
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function load(dateToLoad: string) {
    if (!schoolId) {
      setLoading(false);
      setError("Your session does not contain a school identifier.");
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const [studentPage, dailySummary] = await Promise.all([
        getStudents({ page: 0, size: 100, status: "ACTIVE" }),
        getDailySummary(schoolId, dateToLoad),
      ]);
      setStudents(studentPage.content);
      setSummary(dailySummary);
      setStatuses(Object.fromEntries(studentPage.content.map((student) => [String(student.id), "PRESENT"])));
    } catch (requestError) {
      setError(getApiErrorInfo(requestError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(date);
  }, [schoolId, date]);

  function updateStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((current) => ({ ...current, [studentId]: status }));
    setSaved(false);
  }

  async function saveAttendance() {
    if (!schoolId || students.length === 0 || saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await markBulkAttendance(
        schoolId,
        date,
        students.map((student) => ({
          studentId: String(student.id),
          status: statuses[String(student.id)] ?? "PRESENT",
        })),
      );
      const dailySummary = await getDailySummary(schoolId, date);
      setSummary(dailySummary);
      setSaved(true);
    } catch (requestError) {
      setError(getApiErrorInfo(requestError).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section className="page-section"><p className="state-message">Loading attendance…</p></section>;
  }

  return (
    <section className="page-section" aria-labelledby="attendance-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · Students</p>
          <h1 id="attendance-title">Attendance</h1>
          <p className="subtitle">Record daily attendance for active students and review the daily summary.</p>
        </div>
      </div>

      {error && <p className="state-message error" role="alert">{error}</p>}
      {saved && <p className="state-message success" role="status">Attendance saved successfully.</p>}

      <div className="toolbar attendance-toolbar">
        <label>
          Attendance date
          <input type="date" max={today()} value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button type="button" className="primary-button attendance-save" onClick={() => void saveAttendance()} disabled={saving || students.length === 0}>
          {saving ? "Saving…" : "Save attendance"}
        </button>
      </div>

      {summary && (
        <div className="attendance-summary" aria-label="Daily attendance summary">
          <article><strong>{summary.recorded}</strong><span>Recorded</span></article>
          <article><strong>{summary.present}</strong><span>Present</span></article>
          <article><strong>{summary.absent}</strong><span>Absent</span></article>
          <article><strong>{summary.late}</strong><span>Late</span></article>
          <article><strong>{summary.excused}</strong><span>Excused</span></article>
        </div>
      )}

      <div className="table-card">
        {students.length === 0 ? (
          <p className="state-message">No active students are available for attendance.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Student</th><th>Admission No.</th><th>Class</th><th>Status</th></tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const id = String(student.id);
                return (
                  <tr key={id}>
                    <td>{studentName(student)}</td>
                    <td>{student.admissionNumber ?? "—"}</td>
                    <td>{[student.className, student.sectionName].filter(Boolean).join(" / ") || "—"}</td>
                    <td>
                      <select
                        value={statuses[id] ?? "PRESENT"}
                        aria-label={`Attendance status for ${studentName(student)}`}
                        onChange={(event) => updateStatus(id, event.target.value as AttendanceStatus)}
                      >
                        {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
