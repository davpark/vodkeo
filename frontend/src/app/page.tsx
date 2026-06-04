import { getPosts, getTags, getTopPosts, getStats } from '@/lib/api'
import Link from 'next/link'
import { Post, TopPost } from '@/types'
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
  const session = await getSession()

  let posts: Post[] = []
  let topPosts: TopPost[] = []
  let tags: { tag: string; count: number }[] = []
  let stats = { postCount: 0, tagCount: 0 }

  try {
    [posts, topPosts, tags, stats] = await Promise.all([
      getPosts(tag, sort),
      getTopPosts(),
      getTags(),
      getStats(),
    ])
  } catch (error) {
    console.error('Failed to load homepage data:', error)
  }

  return (
    <main className="max-w-5xl mx-auto px-2 py-4">

      <div className="stats-bar">
        <span>{stats.postCount} posts</span>
        <span className="stats-divider">·</span>
        <span>{stats.tagCount} tags</span>
      </div>

      {!session && (
        <div className="hero-banner">
          <p className="hero-text">
            Vodkeo is currently invite only.
          </p>
          {/* <div className="hero-actions">
            <Link href="/login" className="btn">Log In</Link>
            <Link href="/signup" className="btn">Sign Up</Link>
          </div> */}
        </div>
      )}

      <div className="home-layout">

        {/* Main feed */}
        <div className="home-main">
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
              <Link href="/" className="" style={{ fontSize: '0.7rem', padding: '0.2em 0.6em', fontStyle: 'italic' }}>
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
                      <Link href={`/posts/${post.id}`}  className="post-preview">
                        {post.content.slice(0, 160)}
                        {post.content.length > 160 ? '...' : ''}
                      </Link>
                      <Link href={`/posts/${post.id}`}  className="post-comment-count">
                        {post.commentCount ?? 0} {(post.commentCount ?? 0) === 1 ? 'comment' : 'comments'}
                      </Link>
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
        </div>

        {/* Sidebar */}
        <aside className="home-sidebar">

          {/* Top Posts */}
          <div className="sidebar-widget">
            <h2 className="sidebar-title">Top Posts</h2>
            {topPosts.length === 0 ? (
              <p className="sidebar-empty">No posts yet.</p>
            ) : (
              <ol className="sidebar-post-list">
                {topPosts.map((post) => (
                  <li key={post.id} className="sidebar-post-item">
                    <Link href={`/posts/${post.id}`} className="sidebar-post-title">
                      {post.title}
                    </Link>
                    <span className="sidebar-post-meta">
                      <span>{post.authorHandle}</span>
                      <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Top Tags */}
          <div className="sidebar-widget">
            <h2 className="sidebar-title">Top Tags</h2>
            {tags.length === 0 ? (
              <p className="sidebar-empty">No tags yet.</p>
            ) : (
              <div className="sidebar-tags">
                {tags.slice(0, 10).map(({ tag, count }) => (
                  <Link
                    key={tag}
                    href={`/?tag=${encodeURIComponent(tag)}`}
                    className="sidebar-tag"
                  >
                    {tag}
                    <span className="tag-count">{count}</span>
                  </Link>
                ))}
                {tags.length > 10 && (
                  <Link href="/tags" className="sidebar-all-tags">
                    View all tags →
                  </Link>
                )}
              </div>
            )}
          </div>

        </aside>
      </div>
    </main>
  )
}