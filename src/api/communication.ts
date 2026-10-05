import { apiClient } from "./client";

export interface NotificationView {
  id: string; schoolId: string; recipientUserId: string; channel: string;
  subject?: string | null; body: string; status: string; attempts: number;
  availableAt: string; lastError?: string | null; sentAt?: string | null;
  readAt?: string | null; createdAt: string;
}
export interface DocumentView {
  id: string; schoolId: string; title: string; description?: string | null;
  fileName: string; contentType: string; storageKey: string; checksum?: string | null;
  audienceRole?: string | null; status: string; uploadedBy: string;
  createdAt: string; updatedAt: string;
}
export async function listNotifications(schoolId:string,limit=50){
  return (await apiClient.get<NotificationView[]>(`/api/v1/schools/${schoolId}/notifications`,{params:{limit}})).data;
}
export async function getUnreadCount(schoolId:string){
  return (await apiClient.get<number>(`/api/v1/schools/${schoolId}/notifications/unread-count`)).data;
}
export async function markNotificationRead(schoolId:string,id:string){
  return (await apiClient.post<NotificationView>(`/api/v1/schools/${schoolId}/notifications/${id}/read`)).data;
}
export async function listDocuments(schoolId:string,publishedOnly=true,limit=50){
  return (await apiClient.get<DocumentView[]>(`/api/v1/schools/${schoolId}/documents`,{params:{publishedOnly,limit}})).data;
}
export async function uploadDocument(schoolId:string,file:File,title:string,description?:string,audienceRole?:string){
  const form=new FormData(); form.append("file",file); form.append("title",title);
  if(description) form.append("description",description); if(audienceRole) form.append("audienceRole",audienceRole);
  return (await apiClient.post<DocumentView>(`/api/v1/schools/${schoolId}/documents/upload`,form)).data;
}
export async function publishDocument(schoolId:string,id:string){
  return (await apiClient.post<DocumentView>(`/api/v1/schools/${schoolId}/documents/${id}/publish`)).data;
}
export async function archiveDocument(schoolId:string,id:string){
  return (await apiClient.post<DocumentView>(`/api/v1/schools/${schoolId}/documents/${id}/archive`)).data;
}
export async function downloadDocument(schoolId:string,id:string){
  return (await apiClient.get<Blob>(`/api/v1/schools/${schoolId}/documents/${id}/content`,{responseType:"blob"})).data;
}
