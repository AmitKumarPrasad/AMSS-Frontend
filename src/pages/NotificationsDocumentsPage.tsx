import { useState } from "react";

type CommunicationTab = "notifications" | "documents";

const notifications = [
  { title: "Fee reminder", audience: "Parents", channel: "In-app", status: "Scheduled" },
  { title: "Exam timetable published", audience: "Students & Parents", channel: "In-app", status: "Sent" },
  { title: "Staff meeting", audience: "Teachers", channel: "Email", status: "Draft" },
];

const documents = [
  { name: "Academic Calendar", type: "PDF", owner: "School Admin", status: "Published" },
  { name: "Fee Structure", type: "PDF", owner: "Accounts", status: "Published" },
  { name: "Student Handbook", type: "PDF", owner: "School Admin", status: "Draft" },
];

export default function NotificationsDocumentsPage() {
  const [tab, setTab] = useState<CommunicationTab>("notifications");

  return (
    <section className="page-section" aria-labelledby="communication-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · Communication</p>
          <h1 id="communication-title">Notifications & Documents</h1>
          <p className="subtitle">Manage school communications and shared documents in one workspace.</p>
        </div>
      </div>

      <div className="academic-tabs" role="tablist" aria-label="Communication sections">
        <button type="button" className={tab === "notifications" ? "active" : ""} onClick={() => setTab("notifications")}>Notifications</button>
        <button type="button" className={tab === "documents" ? "active" : ""} onClick={() => setTab("documents")}>Documents</button>
      </div>

      {tab === "notifications" && (
        <div className="table-card">
          <table><thead><tr><th>Notification</th><th>Audience</th><th>Channel</th><th>Status</th></tr></thead>
          <tbody>{notifications.map((item) => <tr key={item.title}><td>{item.title}</td><td>{item.audience}</td><td>{item.channel}</td><td><span className="badge">{item.status}</span></td></tr>)}</tbody></table>
        </div>
      )}

      {tab === "documents" && (
        <div className="table-card">
          <table><thead><tr><th>Document</th><th>Type</th><th>Owner</th><th>Status</th></tr></thead>
          <tbody>{documents.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.type}</td><td>{item.owner}</td><td><span className="badge">{item.status}</span></td></tr>)}</tbody></table>
        </div>
      )}

      <p className="state-message academic-note">Notification and document API wiring will follow the finalized backend contracts; the UI intentionally avoids assuming undocumented endpoints or storage behavior.</p>
    </section>
  );
}
