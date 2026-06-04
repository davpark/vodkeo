import { getTags } from '@/lib/api'
import Link from 'next/link'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default async function TagsPage() {
  const tags = await getTags()

  // Group tags by first letter
  const grouped = ALPHABET.reduce((acc, letter) => {
    acc[letter] = tags.filter(({ tag }) => 
      tag[0]?.toUpperCase() === letter
    )
    return acc
  }, {} as Record<string, { tag: string; count: number }[]>)

  return (
    <main className="max-w-5xl mx-auto px-2 py-4">
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--foreground-muted)',
        paddingBottom: '1rem'
      }}>
        <h1 style={{ fontSize: '1.1rem', letterSpacing: '0.08em' }}>All Tags</h1>
        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
          {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
        </span>
      </div>

      <div className="tags-grid">
        {ALPHABET.map((letter) => (
          <div key={letter}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              textDecoration: 'underline',
              letterSpacing: '0.1em',
              marginBottom: '0.4rem',
              color: 'var(--foreground)',
            }}>
              {letter}
            </div>
            {grouped[letter].length === 0 ? (
              <em style={{ fontSize: '0.72rem', color: 'var(--foreground-muted)' }}>
                no tags
              </em>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {grouped[letter].map(({ tag, count }) => (
                  <Link
                    key={tag}
                    href={`/?tag=${encodeURIComponent(tag)}`}
                    className="tag-link"
                    style={{ fontSize: '0.8rem' }}
                  >
                    {tag} <span className="tag-count">({count})</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Link href="/" className="tag-link" style={{ fontSize: '0.75rem' }}>
          ← Back to posts
        </Link>
      </div>
    </main>
  )
}