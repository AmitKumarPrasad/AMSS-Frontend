import { getStudents, type Student } from "./students";
import { listSections, type ApiPage } from "./academics";
import { apiClient } from "./client";

export interface AcademicYear { id: string; code: string; name: string; startsOn: string; endsOn: string; status: string; }
export interface SchoolClass { id: string; name: string; gradeLevel: number; status: string; }
export interface Assessment { id: string; academicYearId: string; classId: string; name: string; assessmentDate: string; maxMarks: number; status: string; }
export interface Result { id: string; assessmentId: string; studentId: string; marks: number; grade?: string; status: string; }

export async function listAcademicYears(schoolId: string) {
  const response = await apiClient.get<{ content: AcademicYear[] }>(`/api/v1/schools/${schoolId}/academic-years`, { params: { status: "ACTIVE", page: 0, size: 50 } });
  return response.data.content;
}

export async function listClasses(schoolId: string, academicYearId: string) {
  const response = await apiClient.get<{ content: SchoolClass[] }>(`/api/v1/schools/${schoolId}/classes`, { params: { academicYearId, page: 0, size: 50 } });
  return response.data.content;
}

export async function listAssessments(schoolId: string, academicYearId: string) {
  const response = await apiClient.get<{ content: Assessment[] }>(`/api/v1/schools/${schoolId}/assessments`, { params: { academicYearId, page: 0, size: 50 } });
  return response.data.content;
}

export async function createAssessment(schoolId: string, request: { academicYearId: string; classId: string; name: string; assessmentDate: string; maxMarks: number }) {
  const response = await apiClient.post<Assessment>(`/api/v1/schools/${schoolId}/assessments`, request);
  return response.data;
}

export async function listResults(schoolId: string, assessmentId: string) {
  const response = await apiClient.get<Result[]>(`/api/v1/schools/${schoolId}/assessments/${assessmentId}/results`);
  return response.data;
}

export async function saveResults(schoolId: string, assessmentId: string, entries: Array<{ studentId: string; marks: number; grade?: string }>) {
  const response = await apiClient.post<Result[]>(`/api/v1/schools/${schoolId}/assessments/${assessmentId}/results/bulk`, { entries });
  return response.data;
}

export async function listEnrolledStudents(schoolId: string, classId: string): Promise<Student[]> {
  const sections = await listSections(schoolId, classId);
  const enrolled = new Set<string>();
  for (const section of sections.content) {
    let page = 0;
    while (true) {
      const response = await apiClient.get<ApiPage<{studentId:string;status:string}>>(
        `/api/v1/schools/${schoolId}/enrollments/sections/${section.id}`, {params:{page,size:100}});
      response.data.content.filter(e=>e.status==="ACTIVE").forEach(e=>enrolled.add(e.studentId));
      if (++page >= response.data.totalPages) break;
    }
  }
  if (!enrolled.size) return [];
  const students: Student[]=[];
  let page=0;
  while(true){
    const data=await getStudents(schoolId,{page,size:100,status:"ACTIVE"});
    students.push(...data.content.filter(s=>enrolled.has(String(s.id))));
    if(++page>=data.totalPages)break;
  }
  return students;
}
