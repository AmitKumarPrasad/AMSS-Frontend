import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSections, listTimetable, type SchoolClass, type Subject } from "../api/academics";
import { getApiErrorInfo } from "../api/errorHandling";

export default function TimetablePanel({ schoolId, classes, subjects }: {
  schoolId: string; classes: SchoolClass[]; subjects: Subject[];
}) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const classId = classes.find((item) => item.id === selectedClass)?.id ?? classes[0]?.id ?? "";
  const sections = useQuery({
    queryKey: ["sections", schoolId, classId],
    queryFn: () => listSections(schoolId, classId),
    enabled: Boolean(schoolId && classId),
  });
  const sectionList = sections.data?.content ?? [];
  const sectionId = sectionList.find((item) => item.id === selectedSection)?.id ?? sectionList[0]?.id ?? "";
  const timetable = useQuery({
    queryKey: ["timetable", schoolId, sectionId],
    queryFn: () => listTimetable(schoolId, sectionId),
    enabled: Boolean(schoolId && sectionId),
  });
  const failed = sections.isError ? sections : timetable.isError ? timetable : null;
  return <>
    <div className="filter-bar">
      <label>Class<select value={classId} onChange={(event) => { setSelectedClass(event.target.value); setSelectedSection(""); }}>
        <option value="">Select class</option>
        {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      <label>Section<select value={sectionId} onChange={(event) => setSelectedSection(event.target.value)}>
        <option value="">Select section</option>
        {sectionList.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
    </div>
    {failed ? <div className="state-message error" role="alert">
      <p>{getApiErrorInfo(failed.error).message}</p>
      <button type="button" onClick={() => failed.refetch()} disabled={failed.isFetching}>Retry</button>
    </div> : sections.isLoading || timetable.isLoading ? <p className="state-message">Loading timetable…</p>
      : !sectionId ? <p className="state-message">Select a class with an active section to view its timetable.</p>
      : <div className="table-card"><table>
        <thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Room</th><th>Status</th></tr></thead>
        <tbody>{(timetable.data?.content ?? []).map((item) => <tr key={item.id}>
          <td>{item.dayOfWeek}</td><td>{item.startsAt} – {item.endsAt}</td>
          <td>{subjects.find((subject) => subject.id === item.subjectId)?.name ?? "Subject unavailable"}</td>
          <td>{item.room ?? "—"}</td><td>{item.status}</td>
        </tr>)}{timetable.data?.content.length === 0 && <tr><td colSpan={5}>No timetable entries for this section.</td></tr>}</tbody>
      </table></div>}
  </>;
}
