export function HomePage() {
  return (
    <section className="hero">
      <p className="eyebrow">AMSS · School Management System</p>
      <h1>Frontend foundation is ready.</h1>
      <p className="subtitle">
        React, TypeScript, Vite, routing and API-state foundations are in place for the
        authenticated school management experience.
      </p>
      <div className="cards">
        <article>
          <h2>Backend contract</h2>
          <p>Ready to consume the existing AMSS REST/OpenAPI endpoints.</p>
        </article>
        <article>
          <h2>Next feature</h2>
          <p>Authentication, JWT session handling and the role-aware application shell.</p>
        </article>
      </div>
    </section>
  )
}
