import { apiClient } from "./client";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audienceRole?: string | null;
  status?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
}

export interface DocumentItem {
  id: string;
  title: string;
  description?: string | null;
  fileName: string;
  contentType: string;
  size?: number | null;
  status?: string | null;
  publishedAt?: string | null;
}

export async function listAnnouncements(schoolId: string, page = 0, size = 20) {
  const response = await apiClient.get<{ content: Announcement[]; totalElements?: number }>(
    `/api/v1/schools/${schoolId}/communications/announcements`,
    { params: { publishedOnly: true, page, size } },
  );
  return response.data;
}

export async function markAnnouncementRead(schoolId: string, announcementId: string) {
  await apiClient.post(
    `/api/v1/schools/${schoolId}/communications/announcements/${announcementId}/read`,
  );
}

export async function listDocuments(schoolId: string, limit = 50) {
  const response = await apiClient.get<DocumentItem[]>(
    `/api/v1/schools/${schoolId}/documents`,
    { params: { publishedOnly: true, limit } },
  );
  return response.data;
}

export async function downloadDocument(schoolId: string, documentId: string) {
  const response = await apiClient.get<Blob>(
    `/api/v1/schools/${schoolId}/documents/${documentId}/content`,
    { responseType: "blob" },
  );
  return response.data;
}
