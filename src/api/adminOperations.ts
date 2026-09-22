import { apiClient } from "./client";

export interface DashboardSummary {
  schoolId: string;
  date: string;
  activeStudents: number;
  activeStaff: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  excusedToday: number;
  attendanceRecordedToday: number;
  attendanceRateToday: number;
  pendingLeaves: number;
  unreadNotifications: number;
  overdueInvoices: number;
  outstandingFees: number;
}

export interface AuditEvent {
  id: string;
  schoolId: string;
  actorUserId?: string | null;
  eventType: string;
  aggregateType?: string | null;
  aggregateId?: string | null;
  payload?: string | null;
  createdAt: string;
}

export async function getDashboardSummary(schoolId: string) {
  const response = await apiClient.get<DashboardSummary>(
    `/api/v1/schools/${schoolId}/operations/dashboard`,
  );
  return response.data;
}

export async function listAuditEvents(schoolId: string, limit = 50) {
  const response = await apiClient.get<AuditEvent[]>(
    `/api/v1/schools/${schoolId}/operations/audit`,
    { params: { limit } },
  );
  return response.data;
}
