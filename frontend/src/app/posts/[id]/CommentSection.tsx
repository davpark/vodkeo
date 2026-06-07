'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AtpSession } from '@/lib/session'
import { submitComment, deleteComment } from './actions'
import RichTextEditor from '@/components/RichTextEditor'
import DOMPurify from 'isomorphic-dompurify'

interface Author {
  handle: string
}

interface Comment {
  id: number
  content: string
  authorDid: string
  createdAt: string
  author: Author | null
  parentId: number | null
  parent: {
    id: number
    author: Author | null
  } | null
}

interface Props {
  postId: number
  comments: Comment[]
  session: AtpSession | null
}

function CommentForm({
  postId,
  parentId,
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
}: {
  postId: number
  parentId?: number
  onSubmit: (comment: Comment) => void
  onCancel?: () => void
  placeholder?: string
}) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const plainText = content.replace(/<[^>]+>/g, '')

    if (!plainText.trim()) {
      setError('Comment cannot be empty.')
      return
    }
    if (plainText.length > 500) {
      setError('Comment must be 500 characters or fewer.')
      return
    }

    setLoading(true)
    const result = await submitComment({ postId, content, parentId })
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else if (result?.comment) {
      onSubmit(result.comment)
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="form-field">
        <RichTextEditor
          content={content}
          onChange={setContent}
          minimal
        />
        <span className="form-hint">
          {content.replace(/<[^>]+>/g, '').length}/500 characters
        </span>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Posting...' : 'Post'}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default function CommentSection({ postId, comments: initial, session }: Props) {
  const [comments, setComments] = useState<Comment[]>(initial)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  function handleNewComment(comment: Comment) {
    setComments(prev => [...prev, comment])
    setReplyingTo(null)
  }

  async function handleDelete(commentId: number) {
    const result = await deleteComment(commentId)
    if (!result?.error) {
      setComments(prev => prev.filter(c => c.id !== commentId))
    }
  }

  return (
    <div className="comment-section">
      <h2 className="comment-section-title">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="text-muted">No comments yet.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} id={`comment-${comment.id}`} className="comment">
              <div className="comment-header">
                <Link href={`/u/${comment.author?.handle}`} className="comment-author">
                  {comment.author?.handle ?? 'Unknown'}
                </Link>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
                {session?.did === comment.authorDid && (
                  <button
                    className="comment-delete"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Delete
                  </button>
                )}
              </div>

              {comment.parent && (
                <a
                  href={`#comment-${comment.parent.id}`}
                  className="comment-reply-ref"
                >
                  ↩ replying to @{comment.parent.author?.handle ?? 'Unknown'}
                </a>
              )}

              <div
                className="comment-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }}
              />

              {session && (
                <button
                  className="comment-reply-btn"
                  onClick={() => setReplyingTo(
                    replyingTo === comment.id ? null : comment.id
                  )}
                >
                  {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                </button>
              )}

              {replyingTo === comment.id && (
                <div className="comment-reply-form">
                  <CommentForm
                    postId={postId}
                    parentId={comment.id}
                    onSubmit={handleNewComment}
                    onCancel={() => setReplyingTo(null)}
                    placeholder={`Reply to @${comment.author?.handle}...`}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {session ? (
        <div className="comment-new">
          <h3 className="comment-section-title">Leave a comment</h3>
          <CommentForm
            postId={postId}
            onSubmit={handleNewComment}
          />
        </div>
      ) : (
        <p className="text-muted" style={{ marginTop: '1.5rem' }}>
          <Link href="/login" className="tag-link">Log in</Link> to leave a comment.
        </p>
      )}
    </div>
  )
}