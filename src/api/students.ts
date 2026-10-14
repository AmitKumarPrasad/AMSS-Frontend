import { apiClient } from "./client";

export interface Student {
  id: string | number;
  admissionNumber?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  status?: string;
  className?: string;
  sectionName?: string;
}

export interface StudentPage {
  content: Student[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface StudentApiResponse {
  content?: Student[];
  data?: Student[];
  items?: Student[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  page?: number;
  size?: number;
}

export async function getStudents(
  schoolId: string,
  params: { page: number; size: number; status?: string; search?: string },
): Promise<StudentPage> {
  if (!schoolId) throw new Error("Your session does not contain a school identifier.");
  const response = await apiClient.get<StudentApiResponse>(
    `/api/v1/schools/${schoolId}/students`,
    {
      params: {
        page: params.page,
        size: params.size,
        ...(params.status ? { status: params.status } : {}),
        ...(params.search ? { q: params.search } : {}),
      },
    },
  );

  const payload = response.data;
  const content = payload.content ?? payload.data ?? payload.items ?? [];
  const totalElements = payload.totalElements ?? content.length;
  const size = payload.size ?? params.size;

  return {
    content,
    totalElements,
    totalPages: payload.totalPages ?? Math.max(1, Math.ceil(totalElements / size)),
    number: payload.number ?? payload.page ?? params.page,
    size,
  };
}
