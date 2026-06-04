export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '2rem', marginBottom: '2rem' }}>
        Privacy Policy
      </h1>
      <div className="post-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.5rem' }}>What we collect</h2>
          <p>When you sign in via ATProto, we receive your decentralized identifier (DID) and handle. We store posts and comments you create on Vodkeo.</p>
        </section>
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.5rem' }}>How we use it</h2>
          <p>Your data is used solely to operate Vodkeo. We do not sell, share, or use your data for advertising or analytics.</p>
        </section>
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.5rem' }}>Data retention</h2>
          <p>Your data is retained as long as your account exists. You may delete your account at any time from Account Settings, which removes all associated posts and comments.</p>
        </section>
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.5rem' }}>Contact</h2>
          <p>For any privacy concerns, please reach out via the GitHub repository.</p>
        </section>
      </div>
    </main>
  )
}