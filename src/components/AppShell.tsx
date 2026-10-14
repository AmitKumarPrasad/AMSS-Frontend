import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { ROLES, hasAnyRole } from "../auth/roles";

export default function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const roles = user?.roles;
  const canManageSchool = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
  const canManageAcademics = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER]);
  const canManageFinance = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.ACCOUNTANT]);
  const canManageAttendance = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER]);
  const canSelfServe = hasAnyRole(roles, [ROLES.PARENT, ROLES.STUDENT]);

  const linkClass = ({ isActive }: { isActive: boolean }) => isActive ? "nav-link active" : "nav-link";

  return (
    <div className="product-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="brand-mark">E</div>
          <div><strong>EduSphere AI</strong><span>AMSS</span></div>
        </div>
        <nav className="sidebar-nav">
          <NavLink className={linkClass} to="/" end>Dashboard</NavLink>
          {canManageAcademics && <NavLink className={linkClass} to="/students">Students</NavLink>}
          {canManageAcademics && <NavLink className={linkClass} to="/staff">Staff</NavLink>}
          {canManageAttendance && <NavLink className={linkClass} to="/attendance">Attendance</NavLink>}
          {canManageAcademics && <NavLink className={linkClass} to="/academics">Academics</NavLink>}
          {canManageAcademics && <NavLink className={linkClass} to="/assessments">Exams & Grades</NavLink>}
          {canManageFinance && <NavLink className={linkClass} to="/finance">Finance</NavLink>}
          <NavLink className={linkClass} to="/notifications-documents">Documents</NavLink>
          {canSelfServe && <NavLink className={linkClass} to="/self-service">My Portal</NavLink>}
          {canManageSchool && <NavLink className={linkClass} to="/admin/operations">Operations</NavLink>}
          {canManageSchool && <NavLink className={linkClass} to="/academic-setup">Academic Setup</NavLink>}
          {canManageSchool && <NavLink className={linkClass} to="/school-setup">School Setup</NavLink>}
          <NavLink className={linkClass} to="/help">Help</NavLink>
          <NavLink className={linkClass} to="/ai-assistant">AI Assistant</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">{(user?.username ?? "U").slice(0, 1).toUpperCase()}</div>
          <div className="user-copy"><strong>{user?.username ?? "User"}</strong><span>{roles?.[0] ?? "Authenticated"}</span></div>
          <button type="button" className="logout-button" onClick={logout}>Log out</button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div><span className="topbar-kicker">School Management</span><strong>EduSphere AI</strong></div>
          <div className="topbar-actions"><span className="live-dot" /> Secure session</div>
        </header>
        <main className="shell-content"><Outlet /></main>
      </div>
    </div>
  );
}
