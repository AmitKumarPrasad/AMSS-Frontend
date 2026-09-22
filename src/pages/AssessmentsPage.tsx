import { FormEvent, useEffect, useMemo, useState } from "react";
import { getStudents, type Student } from "../api/students";
import { getApiErrorInfo } from "../api/errorHandling";
import { getSchoolIdFromToken } from "../api/aiAssistant";
import { useAuthStore } from "../auth/authStore";
import { createAssessment, listAcademicYears, listAssessments, listClasses, listResults, saveResults, type AcademicYear, type Assessment, type Result, type SchoolClass } from "../api/assessments";

function studentName(student: Student) {
  return student.name ?? ([student.firstName, student.lastName].filter(Boolean).join(" ") || String(student.id));
}

export default function AssessmentsPage() {
  const token = useAuthStore((state) => state.accessToken);
  const schoolId = useMemo(() => getSchoolIdFromToken(token), [token]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [yearId, setYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [assessmentId, setAssessmentId] = useState("");
  const [name, setName] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [maxMarks, setMaxMarks] = useState("100");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) { setLoading(false); setError("Your session does not contain a school identifier."); return; }
    void listAcademicYears(schoolId).then((data) => {
      setYears(data);
      if (data[0]) setYearId(data[0].id);
    }).catch((requestError) => setError(getApiErrorInfo(requestError).message)).finally(() => setLoading(false));
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId || !yearId) return;
    setClassId(""); setAssessmentId("");
    void Promise.all([listClasses(schoolId, yearId), listAssessments(schoolId, yearId)])
      .then(([classData, assessmentData]) => {
        setClasses(classData); setAssessments(assessmentData);
        if (classData[0]) setClassId(classData[0].id);
        if (assessmentData[0]) setAssessmentId(assessmentData[0].id);
      }).catch((requestError) => setError(getApiErrorInfo(requestError).message));
  }, [schoolId, yearId]);

  useEffect(() => {
    if (!schoolId || !classId) return;
    void getStudents({ page: 0, size: 100, status: "ACTIVE" }).then((page) => setStudents(page.content))
      .catch((requestError) => setError(getApiErrorInfo(requestError).message));
  }, [schoolId, classId]);

  useEffect(() => {
    if (!schoolId || !assessmentId) return;
    void listResults(schoolId, assessmentId).then((items) => setResults(Object.fromEntries(items.map((item) => [item.studentId, item]))))
      .catch((requestError) => setError(getApiErrorInfo(requestError).message));
  }, [schoolId, assessmentId]);

  async function submitAssessment(event: FormEvent) {
    event.preventDefault();
    if (!schoolId || !yearId || !classId || !name.trim()) return;
    setError(null); setMessage(null);
    try {
      const created = await createAssessment(schoolId, { academicYearId: yearId, classId, name: name.trim(), assessmentDate, maxMarks: Number(maxMarks) });
      setAssessments((current) => [created, ...current]);
      setAssessmentId(created.id);
      setName("");
      setMessage("Assessment created successfully.");
    } catch (requestError) { setError(getApiErrorInfo(requestError).message); }
  }

  function updateResult(studentId: string, field: "marks" | "grade", value: string) {
    setResults((current) => ({
      ...current,
      [studentId]: { ...(current[studentId] ?? { id: "", assessmentId, studentId, marks: 0, status: "RECORDED" }), [field]: field === "marks" ? Number(value) : value },
    }));
    setMessage(null);
  }

  async function submitResults() {
    if (!schoolId || !assessmentId || saving) return;
    setSaving(true); setError(null); setMessage(null);
    try {
      await saveResults(schoolId, assessmentId, students.map((student) => ({
        studentId: String(student.id),
        marks: results[String(student.id)]?.marks ?? 0,
        grade: results[String(student.id)]?.grade || undefined,
      })));
      setMessage("Grades saved successfully.");
    } catch (requestError) { setError(getApiErrorInfo(requestError).message); } finally { setSaving(false); }
  }

  if (loading) return <section className="page-section"><p className="state-message">Loading assessments…</p></section>;

  return <section className="page-section" aria-labelledby="assessments-title">
    <div className="page-heading"><div><p className="eyebrow">AMSS · Academics</p><h1 id="assessments-title">Exams & Grades</h1><p className="subtitle">Create assessments and record student marks and grades.</p></div></div>
    {error && <p className="state-message error" role="alert">{error}</p>}
    {message && <p className="state-message success" role="status">{message}</p>}

    <div className="assessment-controls">
      <label>Academic year<select value={yearId} onChange={(e) => setYearId(e.target.value)}>{years.map((year) => <option key={year.id} value={year.id}>{year.name} ({year.code})</option>)}</select></label>
      <label>Class<select value={classId} onChange={(e) => setClassId(e.target.value)}>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Assessment<select value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)}>{assessments.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.assessmentDate}</option>)}</select></label>
    </div>

    <form className="assessment-form" onSubmit={submitAssessment}>
      <input aria-label="Assessment name" placeholder="Assessment name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input aria-label="Assessment date" type="date" value={assessmentDate} onChange={(e) => setAssessmentDate(e.target.value)} required />
      <input aria-label="Maximum marks" type="number" min="0.01" step="0.01" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} required />
      <button className="primary-button" type="submit" disabled={!yearId || !classId}>Create assessment</button>
    </form>

    <div className="table-card">
      {students.length === 0 ? <p className="state-message">No active students are available.</p> : <>
        <table><thead><tr><th>Student</th><th>Admission No.</th><th>Marks</th><th>Grade</th></tr></thead>
          <tbody>{students.map((student) => { const id = String(student.id); const result = results[id]; return <tr key={id}>
            <td>{studentName(student)}</td><td>{student.admissionNumber ?? "—"}</td>
            <td><input className="grade-input" type="number" min="0" step="0.01" value={result?.marks ?? 0} onChange={(e) => updateResult(id, "marks", e.target.value)} /></td>
            <td><input className="grade-input" maxLength={16} value={result?.grade ?? ""} onChange={(e) => updateResult(id, "grade", e.target.value)} /></td>
          </tr>; })}</tbody>
        </table>
        <div className="assessment-actions"><button type="button" className="primary-button" onClick={() => void submitResults()} disabled={!assessmentId || saving}>{saving ? "Saving…" : "Save grades"}</button></div>
      </>}
    </div>
  </section>;
}
