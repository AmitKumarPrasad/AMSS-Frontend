import { Link, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./auth/authStore";
import ProtectedRoute from "./auth/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function AuthenticatedHome() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">AMSS</Link>
        <nav className="nav-actions">
          {user?.username && <span className="session-user">{user.username}</span>}
          <button type="button" onClick={logout}>Logout</button>
        </nav>
      </header>
      <main className="page">
        <HomePage />
      </main>
    </>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AuthenticatedHome />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
