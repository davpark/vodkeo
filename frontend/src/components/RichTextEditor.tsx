'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEffect, useState, useRef } from 'react'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minimal?: boolean
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)
}
export default function RichTextEditor({ content, onChange, placeholder, minimal }: Props) {
  const [, forceUpdate] = useState(0)
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const ImagePasteHandler = Extension.create({
  name: 'imagePasteHandler',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imagePasteHandler'),
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData('text/plain')?.trim()
            if (!text) return false
            if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(text)) {
              const node = view.state.schema.nodes.image?.create({ src: text })
              if (!node) return false
              const tr = view.state.tr.replaceSelectionWith(node)
              view.dispatch(tr)
              return true
            }
            return false
          },
        },
      }),
    ]
  },
})

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rte-image',
        },
      }),
      ImagePasteHandler,
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const update = () => forceUpdate(n => n + 1)
    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowLinkPopover(false)
      }
    }
    if (showLinkPopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLinkPopover])

  if (!editor) return null

  function handleLinkButton() {
    if (editor!.isActive('link')) {
      editor!.chain().focus().unsetLink().run()
      return
    }
    const { from, to } = editor!.state.selection
    const selectedText = editor!.state.doc.textBetween(from, to)
    setLinkText(selectedText)
    setLinkUrl('')
    setShowLinkPopover(true)
  }

  function handleLinkSubmit() {
    if (!linkUrl.trim()) return
    const url = linkUrl.trim()

    if (isImageUrl(url)) {
      editor!.chain().focus().setImage({ src: url, alt: linkText || '' }).run()
    } else {
      const { from, to } = editor!.state.selection
      const hasSelection = from !== to
      if (!hasSelection && linkText) {

        editor!.chain().focus().insertContent(
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
        ).run()
      } else {
        editor!.chain().focus().setLink({ href: url }).run()
      }
    }

    setShowLinkPopover(false)
    setLinkText('')
    setLinkUrl('')
  }

  function handleEditorClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG') {
      setLightboxSrc((target as HTMLImageElement).src)
    }
  }

  return (
    <>
      <div className="rte-wrapper">
        <div className="rte-toolbar">
          <button
            type="button"
            className={`rte-btn ${editor.isActive('bold') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >B</button>
          <button
            type="button"
            className={`rte-btn ${editor.isActive('italic') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >I</button>

          {/* Link button + popover */}
          <div className="rte-link-wrapper" ref={popoverRef}>
            <button
              type="button"
              className={`rte-btn ${editor.isActive('link') ? 'active' : ''}`}
              onClick={handleLinkButton}
            >
              {editor.isActive('link') ? 'Unlink' : 'Link'}
            </button>

            {showLinkPopover && (
              <div className="rte-link-popover">
                <div className="form-field" style={{ marginBottom: '0.5rem' }}>
                  <label className="rte-popover-label">Text</label>
                  <input
                    type="text"
                    className="navbar-search"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={linkText}
                    onChange={e => setLinkText(e.target.value)}
                    placeholder="Link text (optional)"
                  />
                </div>
                <div className="form-field" style={{ marginBottom: '0.75rem' }}>
                  <label className="rte-popover-label">URL</label>
                  <input
                    type="text"
                    className="navbar-search"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleLinkSubmit() } }}
                    autoFocus
                  />
                </div>
                {linkUrl && isImageUrl(linkUrl) && (
                  <p className="rte-popover-hint">
                    Image URL detected — will be embedded inline.
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleLinkSubmit}
                    style={{ fontSize: '0.7rem', padding: '0.3em 0.75em' }}
                  >
                    {linkUrl && isImageUrl(linkUrl) ? 'Insert Image' : 'Insert Link'}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowLinkPopover(false)}
                    style={{ fontSize: '0.7rem', padding: '0.3em 0.75em' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {!minimal && (
            <>
              <button
                type="button"
                className={`rte-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >•</button>
              <button
                type="button"
                className={`rte-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >1.</button>
            </>
          )}
        </div>

        <div onClick={handleEditorClick}>
          <EditorContent editor={editor} className="rte-content" />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="rte-lightbox" onClick={() => setLightboxSrc(null)}>
          <div className="rte-lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={lightboxSrc} alt="" />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'center' }}>
              <a
                href={lightboxSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: '0.7rem' }}
              >
                Open in new tab
              </a>
              <button
                className="btn"
                onClick={() => setLightboxSrc(null)}
                style={{ fontSize: '0.7rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}