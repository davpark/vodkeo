'use client'

import { useState, KeyboardEvent } from 'react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  maxLength?: number
}

const ALLOWED = /^[a-zA-Z0-9 -]*$/

export default function TagInput({
  tags,
  onChange,
  maxTags = 10,
  maxLength = 20,
}: TagInputProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  function addTag(raw: string) {
    const tag = raw.toLowerCase().trim().replace(/\s+/g, ' ')
    setError('')

    if (!tag) return
    if (!ALLOWED.test(tag)) {
      setError('Tags can only contain letters, numbers, spaces, and hyphens.')
      return
    }
    if (tag.length > maxLength) {
      setError(`Tags must be ${maxLength} characters or fewer.`)
      return
    }
    if (tags.includes(tag)) {
      setError('That tag has already been added.')
      return
    }
    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags.`)
      return
    }

    onChange([...tags, tag])
    setInput('')
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index))
    setError('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className="tag-input-wrapper">
      <div className="tag-input-field">
        {tags.map((tag, i) => (
          <span key={i} className="tag-chip">
            {tag}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => removeTag(i)}
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => {
            // Strip commas from input — they trigger addTag instead
            setInput(e.target.value.replace(',', ''))
            setError('')
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) addTag(input) }}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
          className="tag-input-inner"
          disabled={tags.length >= maxTags}
        />
      </div>
      {error && <p className="form-error" style={{ marginTop: '0.25rem' }}>{error}</p>}
      <span className="form-hint">
        Press comma or Enter to add. {tags.length}/{maxTags} tags.
      </span>
    </div>
  )
}