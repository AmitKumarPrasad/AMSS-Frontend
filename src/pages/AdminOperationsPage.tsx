import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../auth/authStore";
import { getSchoolIdFromToken } from "../api/aiAssistant";
import { getDashboardSummary, listAuditEvents, type AuditEvent, type DashboardSummary } from "../api/adminOperations";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export default function AdminOperationsPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const schoolId = useMemo(() => getSchoolIdFromToken(accessToken), [accessToken]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      setError("Your session does not contain a school identifier.");
      return;
    }
    let active = true;
    Promise.all([getDashboardSummary(schoolId), listAuditEvents(schoolId)])
      .then(([dashboard, audit]) => {
        if (!active) return;
        setSummary(dashboard);
        setEvents(audit);
      })
      .catch(() => {
        if (active) setError("Unable to load admin operations.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [schoolId]);

  if (loading) return <section className="page-section"><p className="state-message">Loading admin operations…</p></section>;

  return (
    <section className="page-section" aria-labelledby="admin-operations-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · Administration</p>
          <h1 id="admin-operations-title">Operations</h1>
          <p className="subtitle">School-wide operational metrics and recent audit activity.</p>
        </div>
      </div>

      {error && <p className="state-message error" role="alert">{error}</p>}

      {summary && (
        <div className="cards">
          <article><h2>Active students</h2><p>{summary.activeStudents}</p></article>
          <article><h2>Active staff</h2><p>{summary.activeStaff}</p></article>
          <article><h2>Attendance today</h2><p>{summary.attendanceRateToday.toFixed(1)}%</p></article>
          <article><h2>Outstanding fees</h2><p>₹{Number(summary.outstandingFees).toLocaleString("en-IN")}</p></article>
          <article><h2>Overdue invoices</h2><p>{summary.overdueInvoices}</p></article>
          <article><h2>Pending leaves</h2><p>{summary.pendingLeaves}</p></article>
        </div>
      )}

      {summary && (
        <div className="table-card">
          <div className="section-heading"><h2>Today's attendance</h2></div>
          <table>
            <thead><tr><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th><th>Recorded</th></tr></thead>
            <tbody><tr><td>{summary.presentToday}</td><td>{summary.absentToday}</td><td>{summary.lateToday}</td><td>{summary.excusedToday}</td><td>{summary.attendanceRecordedToday}</td></tr></tbody>
          </table>
        </div>
      )}

      <div className="table-card">
        <div className="section-heading"><h2>Recent audit activity</h2></div>
        {events.length === 0 ? (
          <p className="state-message">No audit events are available.</p>
        ) : (
          <table>
            <thead><tr><th>Event</th><th>Aggregate</th><th>Actor</th><th>Time</th></tr></thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.eventType}</td>
                  <td>{event.aggregateType ?? "—"}</td>
                  <td>{event.actorUserId ?? "System"}</td>
                  <td>{formatDate(event.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
