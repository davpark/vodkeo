'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect, useState } from 'react'

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minimal?: boolean
}

export default function RichTextEditor({ content, onChange, placeholder, minimal }: Props) {
    const editor = useEditor({
        extensions: [
        StarterKit,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
            },
        }),
        ],
        content,
        onUpdate({ editor }) {
        onChange(editor.getHTML())
        },
    })

    const [, forceUpdate] = useState(0)

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

    if (!editor) return null

    function handleLink() {
        if (editor!.isActive('link')) {
        editor!.chain().focus().unsetLink().run()
        } else {
        const url = window.prompt('Enter URL:')
        if (url) {
            editor!.chain().focus().setLink({ href: url }).run()
        }
        }
    }

    return (
        <div className="rte-wrapper">
            <div className="rte-toolbar">
                <button
                type="button"
                className={`rte-btn ${editor.isActive('bold') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleBold().run()}>
                    B
                </button>
                <button
                type="button"
                className={`rte-btn ${editor.isActive('italic') ? 'active' : ''}`}
                onClick={() => editor.chain().focus().toggleItalic().run()}>
                    I
                </button>
                <button
                type="button"
                className={`rte-btn ${editor.isActive('link') ? 'active' : ''}`}
                onClick={handleLink}
                >
                    {editor.isActive('link') ? 'Unlink' : 'Link'}
                </button>
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
            <EditorContent editor={editor} className="rte-content" />
        </div>
    )
}