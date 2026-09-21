import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <main className="page">
      <section className="empty-state">
        <h1>Access denied</h1>
        <p>Your account does not have permission to access this area.</p>
        <Link to="/">Return to dashboard</Link>
      </section>
    </main>
  );
}
