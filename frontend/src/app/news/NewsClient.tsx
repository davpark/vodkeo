'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitPost } from '@/app/posts/create/actions'
import RichTextEditor from '@/components/RichTextEditor'
import { Post } from '@/types'

export default function NewsClient({ isAdmin, posts }: { isAdmin: boolean; posts: Post[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.content.trim()) { setError('Content is required.'); return }

    setLoading(true)
    try {
      const result = await submitPost({ title: form.title, content: form.content, tags: 'news' })
      if (result?.error) {
        setError(result.error)
      } else {
        setForm({ title: '', content: '' })
        setShowForm(false)
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-top-bar" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>News</h1>
        {isAdmin && !showForm && (
          <button className="btn" onClick={() => setShowForm(true)}>
            Create
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="signup-form" style={{ maxWidth: '680px', marginBottom: '2rem' }}>
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Content</label>
            <RichTextEditor
              content={form.content}
              onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
            />
          </div>

          <div className="form-field">
            <label>Tag</label>
            <div className="tag-input-wrapper">
              <div className="tag-input-field">
                <span className="tag-chip">news</span>
              </div>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => { setShowForm(false); setError('') }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {posts.length === 0 ? (
        <p className="text-muted" style={{ marginTop: '2rem' }}>No news yet.</p>
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
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <Link href={`/u/${post.authorHandle}`} className="post-author">
                  {post.authorHandle ?? 'Unknown'}
                </Link>
              </div>
              <div className="post-card-bottom">
                <Link href={`/posts/${post.id}`} className="post-preview">
                  {post.content.replace(/<[^>]+>/g, '').slice(0, 160)}
                  {post.content.replace(/<[^>]+>/g, '').length > 160 ? '...' : ''}
                </Link>
                <Link href={`/posts/${post.id}`} className="post-comment-count">
                  {post.commentCount ?? 0} {(post.commentCount ?? 0) === 1 ? 'comment' : 'comments'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
