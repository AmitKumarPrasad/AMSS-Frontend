import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="empty-state">
      <h1>Page not found</h1>
      <Link to="/">Return to AMSS</Link>
    </section>
  )
}
