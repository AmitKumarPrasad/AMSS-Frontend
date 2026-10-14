import { ROLES, hasAnyRole } from "../auth/roles";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../auth/authStore";
import { getSchoolIdFromToken } from "../api/aiAssistant";
import { getApiErrorInfo } from "../api/errorHandling";
import { archiveDocument, publishDocument, downloadDocument, listDocuments, listNotifications, markNotificationRead, uploadDocument, type DocumentView, type NotificationView } from "../api/communication";

type CommunicationTab="notifications"|"documents";
export default function NotificationsDocumentsPage(){
 const roles=useAuthStore(s=>s.user?.roles);
 const canPublish=hasAnyRole(roles,[ROLES.SUPER_ADMIN,ROLES.SCHOOL_ADMIN,ROLES.TEACHER]);
 const canArchive=hasAnyRole(roles,[ROLES.SUPER_ADMIN,ROLES.SCHOOL_ADMIN]);
 const accessToken=useAuthStore(s=>s.accessToken);
 const schoolId=useMemo(()=>getSchoolIdFromToken(accessToken),[accessToken]);
 const [tab,setTab]=useState<CommunicationTab>("notifications");
 const [notifications,setNotifications]=useState<NotificationView[]>([]);
 const [documents,setDocuments]=useState<DocumentView[]>([]);
 const [error,setError]=useState<string|null>(null);
 const [loading,setLoading]=useState(true);
 const [file,setFile]=useState<File|null>(null);
 const [title,setTitle]=useState("");
 const [saving,setSaving]=useState(false);
 const load=async()=>{if(!schoolId)return;setLoading(true);setError(null);try{const [n,d]=await Promise.all([listNotifications(schoolId),listDocuments(schoolId,!canPublish)]);setNotifications(n);setDocuments(d);}catch(e){setError(getApiErrorInfo(e).message);}finally{setLoading(false);}};
 useEffect(()=>{if(!schoolId){setLoading(false);setError("Your session does not contain a school identifier.");return;}void load();},[schoolId,canPublish]);
 const read=async(id:string)=>{if(!schoolId)return;try{const updated=await markNotificationRead(schoolId,id);setNotifications(items=>items.map(x=>x.id===id?updated:x));}catch(e){setError(getApiErrorInfo(e).message);}};
 const upload=async(e:React.FormEvent)=>{e.preventDefault();if(!schoolId||!file)return;setSaving(true);setError(null);try{await uploadDocument(schoolId,file,title);setFile(null);setTitle("");setDocuments(await listDocuments(schoolId,!canPublish));}catch(err){setError(getApiErrorInfo(err).message);}finally{setSaving(false);}};
 const changeStatus=async(id:string,action:"publish"|"archive")=>{if(!schoolId||saving)return;setSaving(true);setError(null);try{const updated=await (action==="publish"?publishDocument(schoolId,id):archiveDocument(schoolId,id));setDocuments(items=>items.map(item=>item.id===id?updated:item));}catch(e){setError(getApiErrorInfo(e).message);}finally{setSaving(false);}};
 const download=async(doc:DocumentView)=>{if(!schoolId)return;try{const blob=await downloadDocument(schoolId,doc.id);const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=doc.fileName;a.click();URL.revokeObjectURL(url);}catch(e){setError(getApiErrorInfo(e).message);}};
 return <section className="page-section" aria-labelledby="communication-title">
  <div className="page-heading"><div><p className="eyebrow">AMSS · Communication</p><h1 id="communication-title">Notifications & Documents</h1><p className="subtitle">Live school communications and shared documents.</p></div></div>
  {error&&<p className="state-message error" role="alert">{error}</p>}
  <div className="academic-tabs" role="tablist"><button type="button" className={tab==="notifications"?"active":""} onClick={()=>setTab("notifications")}>Notifications</button><button type="button" className={tab==="documents"?"active":""} onClick={()=>setTab("documents")}>Documents</button></div>
  {loading?<p className="state-message">Loading communication data…</p>:tab==="notifications"?<div className="table-card"><table><thead><tr><th>Subject</th><th>Channel</th><th>Status</th><th>Created</th><th>Action</th></tr></thead><tbody>{notifications.map(n=><tr key={n.id}><td>{n.subject||n.body}</td><td>{n.channel}</td><td><span className="badge">{n.readAt?"READ":n.status}</span></td><td>{new Date(n.createdAt).toLocaleString()}</td><td>{!n.readAt&&<button type="button" onClick={()=>void read(n.id)}>Mark read</button>}</td></tr>)}{notifications.length===0&&<tr><td colSpan={5}>No notifications.</td></tr>}</tbody></table></div>:<>
   {canPublish&&<form className="filter-bar" onSubmit={upload}><label>Title<input required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)}/></label><label>File<input required type="file" onChange={e=>setFile(e.target.files?.[0]??null)}/></label><button className="primary-button" disabled={saving||!file} type="submit">{saving?"Uploading…":"Upload document"}</button></form>}
   <div className="table-card"><table><thead><tr><th>Document</th><th>Type</th><th>Audience</th><th>Status</th><th>Action</th></tr></thead><tbody>{documents.map(d=><tr key={d.id}><td>{d.title}</td><td>{d.contentType}</td><td>{d.audienceRole||"All roles"}</td><td><span className="badge">{d.status}</span></td><td>{d.status==="PUBLISHED"&&<button type="button" onClick={()=>void download(d)}>Download</button>}{canPublish&&d.status==="DRAFT"&&<button type="button" disabled={saving} onClick={()=>void changeStatus(d.id,"publish")}>Publish</button>}{canArchive&&d.status!=="ARCHIVED"&&<button type="button" disabled={saving} onClick={()=>void changeStatus(d.id,"archive")}>Archive</button>}</td></tr>)}{documents.length===0&&<tr><td colSpan={5}>No documents found.</td></tr>}</tbody></table></div></>}
 </section>;
}
