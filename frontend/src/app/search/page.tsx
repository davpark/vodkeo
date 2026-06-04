import { getPosts } from '@/lib/api'
import Link from 'next/link'
import { Post } from '@/types'

async function searchPosts(q: string, scope: string): Promise<Post[]> {
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/search?q=${encodeURIComponent(q)}&scope=${encodeURIComponent(scope)}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return []
  return res.json()
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; scope?: string }>
}) {
  const { q, scope = 'all' } = await searchParams
  const posts = q ? await searchPosts(q, scope) : []

  return (
    <main className="max-w-5xl mx-auto px-2 py-4">
      <h1 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>
        {!q ? 'Search' : posts.length === 0 ? (
          `No results found for "${q}"`
        ) : (
          <>
            Results for "{q}"
            <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.75rem', fontWeight: 400, letterSpacing: '0.04em' }}>
              {posts.length} {posts.length === 1 ? 'result' : 'results'}
            </span>
          </>
        )}
      </h1>

      {posts.length > 0 && (
        <div className="post-list">
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-card-top">
                <div className="post-card-top-left">
                  <Link href={`/posts/${post.id}`} className="post-title">
                    {post.title}
                  </Link>
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
                <Link href={`/u/${post.authorHandle}`} className="post-author">
                  {post.authorHandle ?? 'Unknown'}
                </Link>
              </div>
              <div className="post-card-bottom">
                <div className="post-card-bottom-left">
                  <p className="post-preview">
                    {post.content.slice(0, 150)}
                    {post.content.length > 150 ? '...' : ''}
                  </p>
                </div>
                <span className="post-tags">
                  {'tags: '}
                  <em>
                    {post.tags && post.tags.length > 0
                      ? (() => {
                          const joined = post.tags.join(', ')
                          return joined.length > 40 ? joined.slice(0, 40) + '…' : joined
                        })()
                      : 'empty'
                    }
                  </em>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}