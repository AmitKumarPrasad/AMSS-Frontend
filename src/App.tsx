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
import NotificationsDocumentsPage from "./pages/NotificationsDocumentsPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import AttendancePage from "./pages/AttendancePage";
import AssessmentsPage from "./pages/AssessmentsPage";
import SelfServicePage from "./pages/SelfServicePage";
import AdminOperationsPage from "./pages/AdminOperationsPage";

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/notifications-documents" element={<NotificationsDocumentsPage />} />
            <Route path="/ai-assistant" element={<AiAssistantPage />} />
            <Route element={<ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.STUDENT]} />}>
              <Route path="/self-service" element={<SelfServicePage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]} />}>
              <Route path="/admin/operations" element={<AdminOperationsPage />} />
            </Route>
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
