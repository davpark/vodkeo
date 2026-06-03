import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
  tags: string[]
}

interface Profile {
  did: string
  handle: string
  createdAt: string
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params

  const profileRes = await fetch(
    `${process.env.BACKEND_URL}/api/u/${handle}`
  )

  if (!profileRes.ok) notFound()

  const profile: Profile = await profileRes.json()

  const postsRes = await fetch(
    `${process.env.BACKEND_URL}/api/users/posts?did=${encodeURIComponent(profile.did)}`
  )
  const posts: Post[] = postsRes.ok ? await postsRes.json() : []

  return (
    <main className="max-w-5xl mx-auto px-2 py-12">
      <div className="profile-header">
        <h1 className="text-2xl">@{profile.handle}</h1>
        <span className="form-hint">
          Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </span>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 className="profile-section-title">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-muted">No posts yet.</p>
        ) : (
          <div className="post-list">
            {posts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-card-top">
                  <div className="post-card-top-left">
                    <Link href={`/posts/${post.id}`} className="post-title">
                      {post.title}
                    </Link>
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
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
      </div>
    </main>
  )
}