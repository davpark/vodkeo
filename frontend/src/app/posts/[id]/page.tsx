import { getPost } from '@/lib/api';
import Link from 'next/link';
import { getSession } from '@/lib/session'
import CommentSection from './CommentSection'

async function incrementView(id: number) {
  try {
    await fetch(`${process.env.BACKEND_URL}/api/posts/${id}/view`, {
      method: 'POST',
      cache: 'no-store',
    })
  } catch {}
}

async function getComments(id: number) {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/posts/${id}/comments`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params
  const post = await getPost(Number(id))
  const session = await getSession()
  const comments = await getComments(Number(id))

  await incrementView(Number(id))

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="nav-link" style={{ paddingLeft: 0 }}>
        ← Back
      </Link>

      <div style={{ marginTop: '2rem' }}>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '2rem', marginBottom: '0.5rem' }}>
          {post.title}
        </h1>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span className="post-date">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {post.authorHandle && (
            <Link href={`/u/${post.authorHandle}`} className="post-author" style={{ textAlign: 'left' }}>
              {post.authorHandle}
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="post-content">
          {post.content}
        </div>

        <div className="mt-4">
          {post.tags && post.tags.length > 0 && (
            <span className="post-tags" style={{ textAlign: 'left' }}>
              {'tags: '}
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
            </span>
          )}
        </div>
        
        <CommentSection
          postId={Number(id)}
          comments={comments}
          session={session}
        />
      </div>
    </main>
  );
}