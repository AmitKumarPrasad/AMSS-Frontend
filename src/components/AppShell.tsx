import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { ROLES, hasAnyRole } from "../auth/roles";

export default function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const roles = user?.roles;

  const canManageSchool = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
  const canManageAcademics = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER]);
  const canManageFinance = hasAnyRole(roles, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.ACCOUNTANT]);

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">AMSS</Link>
        <nav className="nav-actions">
          <span className="session-user">{user?.username ?? "User"}</span>
          <button type="button" onClick={logout}>Logout</button>
        </nav>
      </header>
      <div className="shell-layout">
        <aside className="sidebar" aria-label="Main navigation">
          <Link to="/">Dashboard</Link>
          {canManageSchool && <Link to="/students">Students</Link>}
          {canManageAcademics && <Link to="/academics">Academics</Link>}
          {canManageFinance && <Link to="/finance">Finance</Link>}
          <Link to="/ai-assistant">AI Assistant</Link>
        </aside>
        <main className="page shell-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
