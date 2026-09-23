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
  active: boolean;
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: number;
  active: boolean;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
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
