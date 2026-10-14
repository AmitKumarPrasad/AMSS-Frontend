import TimetablePanel from "../components/TimetablePanel";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../auth/authStore";
import { getSchoolIdFromToken } from "../api/aiAssistant";
import { getApiErrorInfo } from "../api/errorHandling";
import { listAcademicYears, listClasses, listSubjects, type AcademicYear, type SchoolClass, type Subject } from "../api/academics";

type AcademicTab = "classes" | "subjects" | "timetable";

export default function AcademicsPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const schoolId = useMemo(() => getSchoolIdFromToken(accessToken), [accessToken]);
  const [tab, setTab] = useState<AcademicTab>("classes");
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      setError("Your session does not contain a school identifier.");
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([listAcademicYears(schoolId), listSubjects(schoolId)])
      .then(([yearPage, subjectPage]) => {
        if (!active) return;
        const years = yearPage.content ?? [];
        setAcademicYears(years);
        setSubjects(subjectPage.content ?? []);
        setSelectedYearId((current) => current || years.find((year) => year.status === "ACTIVE")?.id || years[0]?.id || "");
      })
      .catch((err) => {
        if (active) setError(getApiErrorInfo(err).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId || !selectedYearId) {
      setClasses([]);
      return;
    }
    let active = true;
    setClassesLoading(true);
    listClasses(schoolId, selectedYearId)
      .then((page) => {
        if (active) setClasses(page.content ?? []);
      })
      .catch((err) => {
        if (active) setError(getApiErrorInfo(err).message);
      })
      .finally(() => {
        if (active) setClassesLoading(false);
      });
    return () => { active = false; };
  }, [schoolId, selectedYearId]);

  if (loading) {
    return <section className="page-section"><p className="state-message">Loading academics…</p></section>;
  }

  return (
    <section className="page-section" aria-labelledby="academics-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · Academic Management</p>
          <h1 id="academics-title">Academics</h1>
          <p className="subtitle">Organize classes, subjects and weekly teaching schedules from one workspace.</p>
        </div>
      </div>

      {error && <p className="state-message error" role="alert">{error}</p>}

      <div className="academic-summary">
        <article><strong>{classes.length}</strong><span>Classes</span></article>
        <article><strong>{subjects.length}</strong><span>Subjects</span></article>
        <article><strong>{academicYears.length}</strong><span>Academic years</span></article>
      </div>

      <div className="academic-tabs" role="tablist" aria-label="Academic sections">
        <button type="button" className={tab === "classes" ? "active" : ""} onClick={() => setTab("classes")}>Classes & Sections</button>
        <button type="button" className={tab === "subjects" ? "active" : ""} onClick={() => setTab("subjects")}>Subjects</button>
        <button type="button" className={tab === "timetable" ? "active" : ""} onClick={() => setTab("timetable")}>Timetable</button>
      </div>

      {(
        <div className="filter-bar">
          <label>
            Academic year
            <select value={selectedYearId} onChange={(event) => setSelectedYearId(event.target.value)}>
              <option value="">Select academic year</option>
              {academicYears.map((year) => <option key={year.id} value={year.id}>{year.name}{year.status === "ACTIVE" ? " (Active)" : ""}</option>)}
            </select>
          </label>
        </div>
      )}

      {tab === "classes" && (
        <div className="academic-grid">
          {classesLoading ? <p className="state-message">Loading classes…</p> : classes.length === 0 ? <p className="state-message">No classes are available for this academic year.</p> : classes.map((item) => (
            <article className="academic-card" key={item.id}>
              <div><p className="eyebrow">Class</p><h2>{item.name}</h2></div>
              <dl><div><dt>Grade</dt><dd>{item.gradeLevel}</dd></div><div><dt>Status</dt><dd>{item.status === "ACTIVE" ? "Active" : "Inactive"}</dd></div></dl>
            </article>
          ))}
        </div>
      )}

      {tab === "subjects" && (
        <div className="table-card">
          <table><thead><tr><th>Subject</th><th>Code</th></tr></thead>
          <tbody>{subjects.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.code}</td></tr>)}</tbody></table>
        </div>
      )}

      {tab === "timetable" && schoolId && <TimetablePanel schoolId={schoolId} classes={classes} subjects={subjects} />}
    </section>
  );
}
