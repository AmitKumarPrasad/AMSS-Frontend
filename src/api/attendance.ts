import { apiClient } from "./client";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  source: string;
  recordedBy: string;
}

export interface DailySummary {
  date: string;
  recorded: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export async function getDailySummary(schoolId: string, date: string) {
  const response = await apiClient.get<DailySummary>(
    `/api/v1/schools/${schoolId}/attendance/summary`,
    { params: { date } },
  );
  return response.data;
}

export async function markBulkAttendance(
  schoolId: string,
  attendanceDate: string,
  entries: Array<{ studentId: string; status: AttendanceStatus }>,
) {
  const response = await apiClient.post<AttendanceRecord[]>(
    `/api/v1/schools/${schoolId}/attendance/students/bulk`,
    { attendanceDate, entries },
  );
  return response.data;
}

export async function getStudentAttendance(
  schoolId: string,
  studentId: string,
  from: string,
  to: string,
) {
  const response = await apiClient.get<AttendanceRecord[]>(
    `/api/v1/schools/${schoolId}/attendance/students/${studentId}`,
    { params: { from, to } },
  );
  return response.data;
}
