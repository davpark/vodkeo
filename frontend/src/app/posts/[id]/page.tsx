import { getPost } from '@/lib/api';
import Link from 'next/link';
import { getSession } from '@/lib/session'
import CommentSection from './CommentSection'
import DeletePostButton from './DeletePostButton'
import DOMPurify from 'dompurify'

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

  const isDeleted = post.deleted || post.content === '[deleted]'
  const isAuthor = session?.did === post.authorDid

  await incrementView(Number(id))

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="nav-link" style={{ paddingLeft: 0 }}>
        ← Back
      </Link>
      
      <div style={{ marginTop: '2rem' }}>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '2rem', marginBottom: '0.5rem' }}>
          {isDeleted ? '[deleted]' : post.title}
        </h1>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span className="post-date">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {!isDeleted && post.authorHandle && (
            <Link href={`/u/${post.authorHandle}`} className="post-author" style={{ textAlign: 'left' }}>
              {post.authorHandle}
            </Link>
          )}
        </div>

        {isDeleted ? (
          <p className="text-muted" style={{ fontStyle: 'italic', margin: '2rem 0' }}>
            This post has been deleted.
          </p>
        ) : (
          <>
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="mt-4">
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
              </div>
            )}
            {post.editedAt && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <em className="post-date">edited</em>
              </div>
            )}
            {isAuthor && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                <Link href={`/posts/${Number(id)}/edit`} className="btn">
                  Edit Post
                </Link>
                <DeletePostButton postId={Number(id)} />
              </div>
            )}
          </>
        )}
        
        <CommentSection
          postId={Number(id)}
          comments={comments}
          session={session}
        />
      </div>
    </main>
  );
}