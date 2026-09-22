import { Route, Routes } from "react-router-dom";
import { ROLES } from "./auth/roles";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppShell from "./components/AppShell";
import LoginPage from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import StudentsPage from "./pages/StudentsPage";
import AcademicsPage from "./pages/AcademicsPage";
import FinancePage from "./pages/FinancePage";

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/ai-assistant" element={<HomePage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]} />}>
          <Route path="/admin-only" element={<HomePage />} />
        </Route>
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
