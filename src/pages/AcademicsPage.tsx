import { useState } from "react";

type AcademicTab = "classes" | "subjects" | "timetable";

const classes = [
  { name: "Class 10", sections: 2, students: 84, coordinator: "Academic Team" },
  { name: "Class 9", sections: 2, students: 78, coordinator: "Academic Team" },
  { name: "Class 8", sections: 2, students: 72, coordinator: "Academic Team" },
];

const subjects = [
  { name: "Mathematics", code: "MATH", classes: "8, 9, 10", teacher: "Assigned by school" },
  { name: "Science", code: "SCI", classes: "8, 9, 10", teacher: "Assigned by school" },
  { name: "English", code: "ENG", classes: "8, 9, 10", teacher: "Assigned by school" },
];

const timetable = [
  { day: "Monday", periods: "Mathematics · Science · English · Computer" },
  { day: "Tuesday", periods: "English · Mathematics · Science · Activity" },
  { day: "Wednesday", periods: "Science · English · Mathematics · Computer" },
  { day: "Thursday", periods: "Mathematics · Activity · English · Science" },
  { day: "Friday", periods: "English · Science · Mathematics · Library" },
];

export default function AcademicsPage() {
  const [tab, setTab] = useState<AcademicTab>("classes");

  return (
    <section className="page-section" aria-labelledby="academics-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · Academic Management</p>
          <h1 id="academics-title">Academics</h1>
          <p className="subtitle">
            Organize classes, subjects and weekly teaching schedules from one workspace.
          </p>
        </div>
      </div>

      <div className="academic-summary">
        <article><strong>{classes.length}</strong><span>Classes</span></article>
        <article><strong>{subjects.length}</strong><span>Subjects</span></article>
        <article><strong>{timetable.length}</strong><span>Teaching days</span></article>
      </div>

      <div className="academic-tabs" role="tablist" aria-label="Academic sections">
        <button type="button" className={tab === "classes" ? "active" : ""} onClick={() => setTab("classes")}>Classes & Sections</button>
        <button type="button" className={tab === "subjects" ? "active" : ""} onClick={() => setTab("subjects")}>Subjects</button>
        <button type="button" className={tab === "timetable" ? "active" : ""} onClick={() => setTab("timetable")}>Timetable</button>
      </div>

      {tab === "classes" && (
        <div className="academic-grid">
          {classes.map((item) => (
            <article className="academic-card" key={item.name}>
              <div>
                <p className="eyebrow">Class</p>
                <h2>{item.name}</h2>
              </div>
              <dl>
                <div><dt>Sections</dt><dd>{item.sections}</dd></div>
                <div><dt>Students</dt><dd>{item.students}</dd></div>
                <div><dt>Coordinator</dt><dd>{item.coordinator}</dd></div>
              </dl>
              <button type="button" className="secondary-button">Manage sections</button>
            </article>
          ))}
        </div>
      )}

      {tab === "subjects" && (
        <div className="table-card">
          <table>
            <thead><tr><th>Subject</th><th>Code</th><th>Classes</th><th>Teacher</th><th>Action</th></tr></thead>
            <tbody>
              {subjects.map((item) => (
                <tr key={item.code}>
                  <td>{item.name}</td><td>{item.code}</td><td>{item.classes}</td><td>{item.teacher}</td>
                  <td><button type="button" className="secondary-button">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "timetable" && (
        <div className="table-card">
          <table>
            <thead><tr><th>Day</th><th>Periods</th></tr></thead>
            <tbody>
              {timetable.map((item) => (
                <tr key={item.day}><td>{item.day}</td><td>{item.periods}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="state-message academic-note">
        Academic API wiring will be connected after the backend academic contract is finalized; this screen establishes the production UI structure without inventing an API contract.
      </p>
    </section>
  );
}
