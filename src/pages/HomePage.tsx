import { Link } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { ROLES, hasAnyRole } from "../auth/roles";

const today = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
}).format(new Date());

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles ?? [];
  const canManageSchool = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
  const canManageAcademics = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER]);
  const canManageFinance = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.ACCOUNTANT]);

  const modules = [
    canManageSchool && { title: "Students", copy: "Student records, guardians and enrolment.", to: "/students", tone: "blue" },
    canManageAcademics && { title: "Attendance", copy: "Daily attendance and classroom status.", to: "/attendance", tone: "green" },
    canManageAcademics && { title: "Academics", copy: "Classes, subjects and timetable.", to: "/academics", tone: "violet" },
    canManageAcademics && { title: "Exams & Grades", copy: "Assessments, marks and report workflows.", to: "/assessments", tone: "orange" },
    canManageFinance && { title: "Finance", copy: "Fees, invoices and payment tracking.", to: "/finance", tone: "gold" },
    { title: "AI Assistant", copy: "Ask questions using school-aware AI workflows.", to: "/ai-assistant", tone: "cyan" },
  ].filter(Boolean) as Array<{ title: string; copy: string; to: string; tone: string }>;

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">EduSphere AI · {today}</p>
          <h1>School dashboard</h1>
          <p className="subtitle">
            Welcome back{user?.username ? `, ${user.username}` : ""}. Manage daily school operations from one workspace.
          </p>
        </div>
        <div className="status-pill"><span /> Production connected</div>
      </div>

      <div className="overview-grid">
        <article className="overview-card">
          <span>Signed in as</span>
          <strong>{user?.username ?? "User"}</strong>
          <small>{roles.join(" · ") || "Authenticated user"}</small>
        </article>
        <article className="overview-card">
          <span>Application</span>
          <strong>AMSS</strong>
          <small>School Management System</small>
        </article>
        <article className="overview-card">
          <span>Backend</span>
          <strong>Connected</strong>
          <small>Secure REST APIs</small>
        </article>
        <article className="overview-card">
          <span>AI services</span>
          <strong>Available</strong>
          <small>Role-aware assistant</small>
        </article>
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>Management modules</h2>
        </div>
        {canManageSchool && <Link className="text-link" to="/admin/operations">View operations →</Link>}
      </div>

      <div className="module-grid">
        {modules.map((module) => (
          <Link className={`module-card module-${module.tone}`} to={module.to} key={module.to}>
            <div className="module-icon" aria-hidden="true">{module.title.slice(0, 1)}</div>
            <div>
              <h3>{module.title}</h3>
              <p>{module.copy}</p>
            </div>
            <span className="module-arrow">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
