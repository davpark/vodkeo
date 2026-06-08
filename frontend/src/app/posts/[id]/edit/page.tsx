'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import RichTextEditor from '@/components/RichTextEditor'
import TagInput from '@/components/TagInput'
import { editPost } from '../actions'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = Number(params.id)

  const [form, setForm] = useState({ title: '', content: '' })
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`)
      .then(r => r.json())
      .then(post => {
        setForm({ title: post.title, content: post.content })
        setTags(post.tags ?? [])
      })
      .catch(() => setError('Failed to load post.'))
      .finally(() => setFetching(false))
  }, [postId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    if (!form.content.replace(/<[^>]+>/g, '').trim()) {
      setError('Content is required.')
      return
    }

    setLoading(true)
    const result = await editPost(postId, {
      title: form.title,
      content: form.content,
      tags,
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/posts/${postId}`)
    }
  }

  if (fetching) return (
    <main className="max-w-5xl mx-auto px-2 py-12">
      <p className="text-muted">Loading...</p>
    </main>
  )

  return (
    <main className="max-w-5xl mx-auto px-2 py-5">
      <h1 className="text-2xl mb-8">Edit Post</h1>

      <form onSubmit={handleSubmit} className="signup-form" style={{ maxWidth: '680px' }}>

        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
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
          <label>Tags</label>
          <TagInput
            tags={tags}
            onChange={setTags}
            maxTags={10}
            maxLength={20}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => router.push(`/posts/${postId}`)}
          >
            Cancel
          </button>
        </div>

      </form>
    </main>
  )
}