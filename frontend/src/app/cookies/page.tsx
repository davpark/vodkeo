export default function CookiesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '2rem', marginBottom: '2rem' }}>
        Cookie Policy
      </h1>
      <div className="post-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.5rem' }}>What cookies we use</h2>
          <p>Vodkeo uses a single cookie: <code>atproto_session</code>. This cookie stores your session credentials after signing in and is required for the site to function.</p>
        </section>
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.5rem' }}>No tracking cookies</h2>
          <p>We do not use any analytics, advertising, or third-party tracking cookies. The only cookie set by Vodkeo is strictly necessary for authentication.</p>
        </section>
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.5rem' }}>Managing cookies</h2>
          <p>You can clear cookies at any time through your browser settings. Clearing the <code>atproto_session</code> cookie will log you out of Vodkeo.</p>
        </section>
      </div>
    </main>
  )
}