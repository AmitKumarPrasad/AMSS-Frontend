import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { useAuthStore } from "../auth/authStore";
import { getApiErrorInfo } from "../api/errorHandling";
import { listAcademicYears,listClasses,listSubjects,listSections } from "../api/academics";
import { getStudents } from "../api/students";
import OperationForm from "../components/OperationForm";
export default function AcademicSetupPage(){const school=useAuthStore(s=>s.user?.schoolId);const root=`/api/v1/schools/${school}`;const cache=useQueryClient();const [year,setYear]=useState("");const [cls,setCls]=useState("");const [section,setSection]=useState("");
 const years=useQuery({queryKey:["setup-years",school],queryFn:()=>listAcademicYears(school!),enabled:!!school});
 const classes=useQuery({queryKey:["setup-classes",school,year],queryFn:()=>listClasses(school!,year),enabled:!!school&&!!year});
 const subjects=useQuery({queryKey:["setup-subjects",school],queryFn:()=>listSubjects(school!),enabled:!!school});
 const sections=useQuery({queryKey:["setup-sections",school,cls],queryFn:()=>listSections(school!,cls),enabled:!!school&&!!cls});
 const students=useQuery({queryKey:["setup-students",school],queryFn:()=>getStudents(school!,{page:0,size:100,status:"ACTIVE"}),enabled:!!school});
 const refresh=async()=>{await cache.invalidateQueries();};const post=async(path:string,v:unknown)=>{await apiClient.post(root+path,v);await refresh();};
 const subjectOptions=subjects.data?.content.map(s=>({value:s.id,label:s.name}))??[];
 return <section className="page-section"><h1>Academic Setup</h1><p>Create a year, activate it, then add classes, sections and subjects. Assign a subject to the class before adding its timetable.</p>{[years,classes,subjects,sections,students].filter(q=>q.isError).map((q,i)=><p role="alert" key={i}>{getApiErrorInfo(q.error).message}</p>)}
 <OperationForm title="Create academic year" fields={[{name:"code",label:"Code"},{name:"name",label:"Name"},{name:"startsOn",label:"Starts",type:"date"},{name:"endsOn",label:"Ends",type:"date"}]} onSubmit={v=>post("/academic-years",v)}/>
 <label>Academic year<select value={year} onChange={e=>{setYear(e.target.value);setCls("");setSection("");}}><option value="">Select year</option>{years.data?.content.map(y=><option value={y.id} key={y.id}>{y.name} ({y.status})</option>)}</select></label>
 {year&&<><OperationForm title="Year status" fields={[]} submitLabel={years.data?.content.find(y=>y.id===year)?.status==="ACTIVE"?"Deactivate year":"Activate year"} onSubmit={async()=>{await apiClient.patch(`${root}/academic-years/${year}/status`,null,{params:{active:years.data?.content.find(y=>y.id===year)?.status!=="ACTIVE"}});await refresh();}}/><OperationForm title="Create class" fields={[{name:"name",label:"Class name"},{name:"gradeLevel",label:"Grade level",type:"number",min:0,max:20}]} onSubmit={v=>post("/classes",{...v,gradeLevel:Number(v.gradeLevel),academicYearId:year})}/></>}
 <label>Class<select value={cls} onChange={e=>{setCls(e.target.value);setSection("");}}><option value="">Select class</option>{classes.data?.content.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
 {cls&&<OperationForm title="Create section" fields={[{name:"name",label:"Section name"},{name:"room",label:"Room",required:false}]} onSubmit={v=>post(`/classes/${cls}/sections`,v)}/>}
 <OperationForm title="Create subject" fields={[{name:"code",label:"Subject code"},{name:"name",label:"Subject name"}]} onSubmit={v=>post("/academics/subjects",v)}/>
 {cls&&<OperationForm title="Assign subject to class" fields={[{name:"subjectId",label:"Subject",options:subjectOptions}]} onSubmit={v=>post(`/academics/classes/${cls}/subjects/${v.subjectId}`,null)}/>}
 <label>Section<select value={section} onChange={e=>setSection(e.target.value)}><option value="">Select section</option>{sections.data?.content.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
 {section&&<><OperationForm title="Enroll student" fields={[{name:"studentId",label:"Student",options:students.data?.content.map(s=>({value:String(s.id),label:`${s.admissionNumber} · ${s.firstName??s.name??""} ${s.lastName??""}`}))??[]},{name:"enrolledOn",label:"Enrollment date",type:"date"}]} onSubmit={v=>post(`/enrollments/sections/${section}/students`,v)}/><OperationForm title="Add timetable period" fields={[{name:"subjectId",label:"Subject",options:subjectOptions},{name:"dayOfWeek",label:"Day",options:["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"].map(value=>({value,label:value}))},{name:"startsAt",label:"Starts",type:"time"},{name:"endsAt",label:"Ends",type:"time"},{name:"room",label:"Room",required:false}]} onSubmit={v=>post(`/timetable/sections/${section}`,v)}/></>}
 </section>;}
