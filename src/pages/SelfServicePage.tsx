import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../auth/authStore";
import { ROLES, hasAnyRole } from "../auth/roles";
import { getSchoolIdFromToken } from "../api/aiAssistant";
import {
  downloadDocument,
  listAnnouncements,
  listDocuments,
  markAnnouncementRead,
  type Announcement,
  type DocumentItem,
} from "../api/selfService";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export default function SelfServicePage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const schoolId = useMemo(() => getSchoolIdFromToken(accessToken), [accessToken]);
  const isParent = hasAnyRole(user?.roles, [ROLES.PARENT]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      setError("Your session does not contain a school identifier.");
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([listAnnouncements(schoolId), listDocuments(schoolId)])
      .then(([announcementPage, documentItems]) => {
        if (!active) return;
        setAnnouncements(announcementPage.content ?? []);
        setDocuments(documentItems);
      })
      .catch(() => {
        if (active) setError("Unable to load self-service information.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [schoolId]);

  async function markRead(id: string) {
    if (!schoolId) return;
    try {
      await markAnnouncementRead(schoolId, id);
    } catch {
      setError("Unable to mark the announcement as read.");
    }
  }

  async function openDocument(document: DocumentItem) {
    if (!schoolId) return;
    try {
      const blob = await downloadDocument(schoolId, document.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError("Unable to open the selected document.");
    }
  }

  if (loading) {
    return <section className="page-section"><p className="state-message">Loading self-service portal…</p></section>;
  }

  return (
    <section className="page-section" aria-labelledby="self-service-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AMSS · Self-Service</p>
          <h1 id="self-service-title">{isParent ? "Parent Portal" : "Student Portal"}</h1>
          <p className="subtitle">
            {isParent
              ? "Stay up to date with school announcements and published documents."
              : "View school announcements and published documents from your student workspace."}
          </p>
        </div>
      </div>

      {error && <p className="state-message error" role="alert">{error}</p>}

      <div className="cards">
        <article>
          <h2>Announcements</h2>
          <p>{announcements.length} published update{announcements.length === 1 ? "" : "s"}</p>
        </article>
        <article>
          <h2>Documents</h2>
          <p>{documents.length} published document{documents.length === 1 ? "" : "s"}</p>
        </article>
      </div>

      <div className="table-card">
        <div className="section-heading"><h2>Latest announcements</h2></div>
        {announcements.length === 0 ? (
          <p className="state-message">No published announcements are available.</p>
        ) : (
          <div className="self-service-list">
            {announcements.map((item) => (
              <article className="self-service-item" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <small>Published {formatDate(item.publishedAt ?? item.createdAt)}</small>
                </div>
                <button type="button" className="secondary-button" onClick={() => void markRead(item.id)}>Mark read</button>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="table-card">
        <div className="section-heading"><h2>Published documents</h2></div>
        {documents.length === 0 ? (
          <p className="state-message">No published documents are available.</p>
        ) : (
          <div className="self-service-list">
            {documents.map((item) => (
              <article className="self-service-item" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description || item.fileName}</p>
                  <small>{item.fileName} · {item.contentType}</small>
                </div>
                <button type="button" className="secondary-button" onClick={() => void openDocument(item)}>Open</button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
