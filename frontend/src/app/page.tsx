import { getPosts } from '@/lib/api'
import Link from 'next/link'
import { Post } from '@/types'
import ThemeToggle from '@/components/ThemeToggle'
import { getSession } from '@/lib/session'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; sort?: string }>
}) {
  const params = await searchParams
  const tag = params.tag
  const sort = params.sort ?? 'recent'

  let posts: Post[] = []
  const session = await getSession()

  try {
    posts = await getPosts(tag)
  } catch (error) {
    console.error('Failed to load posts:', error)
  }

  return (
    <main className="max-w-5xl mx-auto px-2 py-4">
      <div className="page-top-bar">
        <div className="sort-controls">
          <em className="sort-label">
            {sort === 'popular' ? 'Popular' : 'Most recent'}
          </em>
          <div className="sort-buttons">
            <Link
              href={`/?sort=recent${tag ? `&tag=${tag}` : ''}`}
              className={`sort-btn ${sort !== 'popular' ? 'active' : ''}`}
            >
              Recent
            </Link>
            <Link
              href={`/?sort=popular${tag ? `&tag=${tag}` : ''}`}
              className={`sort-btn ${sort === 'popular' ? 'active' : ''}`}
            >
              Popular
            </Link>
          </div>
        </div>
        {session && (
          <Link href="/posts/create" className="btn">
            Create Post
          </Link>
        )}
        
      </div>

      {tag && (
        <div className="active-filter">
          <span>Showing posts tagged: <em>{tag}</em></span>
          <Link href="/" className="btn" style={{ fontSize: '0.7rem', padding: '0.2em 0.6em' }}>
            Clear
          </Link>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-muted" style={{ marginTop: '2rem' }}>
          {tag ? `No posts tagged "${tag}".` : 'No posts yet.'}
        </p>
      ) : (
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
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <Link href={`/u/${post.authorHandle}`} className="post-author">
                  {post.authorHandle ?? post.author?.name ?? post.author?.email ?? 'Unknown'}
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
                  {post.tags && post.tags.length > 0 ? (
                    <em>
                      {post.tags.map((tag, i) => (
                        <span key={tag}>
                          <Link
                            href={`/?tag=${encodeURIComponent(tag)}`}
                            className="tag-link"
                          >
                            {tag}
                          </Link>
                          {i < post.tags.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </em>
                  ) : (
                    <em>empty</em>
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="page-bottom-bar">
        <ThemeToggle />
      </div>
    </main>
  )
}