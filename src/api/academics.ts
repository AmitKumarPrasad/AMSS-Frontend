import { apiClient } from "./client";

export interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AcademicYear {
  id: string;
  code: string;
  name: string;
  startsOn: string;
  endsOn: string;
  status: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: number;
  status: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
}

export interface Section { id: string; name: string; room?: string; status: string; }
export interface TimetableEntry {
  id: string; subjectId: string; dayOfWeek: string; startsAt: string; endsAt: string;
  room?: string; status: string;
}

export async function listSections(schoolId: string, classId: string) {
  return (await apiClient.get<ApiPage<Section>>(
    `/api/v1/schools/${schoolId}/classes/${classId}/sections`,
    { params: { page: 0, size: 100, status: "ACTIVE" } },
  )).data;
}

export async function listTimetable(schoolId: string, sectionId: string) {
  return (await apiClient.get<ApiPage<TimetableEntry>>(
    `/api/v1/schools/${schoolId}/timetable/sections/${sectionId}`,
    { params: { page: 0, size: 100 } },
  )).data;
}

export async function listAcademicYears(schoolId: string) {
  const response = await apiClient.get<ApiPage<AcademicYear>>(
    `/api/v1/schools/${schoolId}/academic-years`,
    { params: { page: 0, size: 50 } },
  );
  return response.data;
}

export async function listClasses(schoolId: string, academicYearId: string) {
  const response = await apiClient.get<ApiPage<SchoolClass>>(
    `/api/v1/schools/${schoolId}/classes`,
    { params: { academicYearId, page: 0, size: 50 } },
  );
  return response.data;
}

export async function listSubjects(schoolId: string, query?: string) {
  const response = await apiClient.get<ApiPage<Subject>>(
    `/api/v1/schools/${schoolId}/academics/subjects`,
    { params: { q: query || undefined, page: 0, size: 50 } },
  );
  return response.data;
}
