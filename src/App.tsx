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
import StaffPage from "./pages/StaffPage";
import AcademicSetupPage from "./pages/AcademicSetupPage";
import SchoolSetupPage from "./pages/SchoolSetupPage";
import AdminOperationsPage from "./pages/AdminOperationsPage";

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER]} />}>
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/assessments" element={<AssessmentsPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.ACCOUNTANT, ROLES.TEACHER]} />}>
              <Route path="/finance" element={<FinancePage />} />
            </Route>
            <Route path="/notifications-documents" element={<NotificationsDocumentsPage />} />
            <Route path="/ai-assistant" element={<AiAssistantPage />} />
            <Route element={<ProtectedRoute allowedRoles={[ROLES.PARENT, ROLES.STUDENT]} />}>
              <Route path="/self-service" element={<SelfServicePage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]} />}>
              <Route path="/academic-setup" element={<AcademicSetupPage />} />
              <Route path="/school-setup" element={<SchoolSetupPage />} />
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
