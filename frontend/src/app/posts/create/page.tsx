'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitPost } from './actions'

export default function CreatePostPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 4) {
      setError('Maximum 4 images per post.')
      return
    }
    setImages(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    if (!form.content.trim()) {
      setError('Content is required.')
      return
    }

    setLoading(true)

    try {
      const result = await submitPost({
        title: form.title,
        content: form.content,
        tags: form.tags,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-2 py-12">
      <h1 className="text-2xl mb-8">Create Post</h1>

      <form onSubmit={handleSubmit} className="signup-form" style={{ maxWidth: '680px' }}>

        {/* Title */}
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

        {/* Content */}
        <div className="form-field">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={10}
            required
          />
        </div>

        {/* Tags */}
        <div className="form-field">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={form.tags}
            onChange={handleChange}
            placeholder="e.g. news, gaming, art"
          />
          <span className="form-hint">Separate tags with commas.</span>
        </div>

        {/* Images */}
        <div className="form-field">
          <label>Images</label>
          <label htmlFor="images" className="btn" style={{ display: 'inline-block', cursor: 'pointer' }}>
            Add Images
          </label>
          <input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            style={{ display: 'none' }}
          />
          <span className="form-hint">Maximum 4 images.</span>

          {/* Image previews */}
          {previews.length > 0 && (
            <div className="image-previews">
              {previews.map((src, i) => (
                <div key={i} className="image-preview">
                  <img src={src} alt={`Preview ${i + 1}`} />
                  <button
                    type="button"
                    className="image-remove"
                    onClick={() => removeImage(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Publish'}
          </button>
          <button type="button" className="btn" onClick={() => router.back()}>
            Cancel
          </button>
        </div>

      </form>
    </main>
  )
}