'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
  tags: string[]
}

interface UserComment {
  id: number
  content: string
  createdAt: string
  post: {
    id: number
    title: string
    deleted: boolean
  } | null
  parent: {
    id: number
    author: { handle: string } | null
  } | null
}

interface Props {
  posts: Post[]
  comments: UserComment[]
}

export default function ProfileTabs({ posts, comments }: Props) {
  const [tab, setTab] = useState<'posts' | 'comments'>('posts')

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="account-tabs">
        <button
          className={`account-tab ${tab === 'posts' ? 'active' : ''}`}
          onClick={() => setTab('posts')}
        >
          Posts
        </button>
        <button
          className={`account-tab ${tab === 'comments' ? 'active' : ''}`}
          onClick={() => setTab('comments')}
        >
          Comments
        </button>
      </div>

      {tab === 'posts' && (
        <div>
          {posts.length === 0 ? (
            <p className="text-muted" style={{ marginTop: '1rem' }}>No posts yet.</p>
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
                        {post.content.replace(/<[^>]+>/g, '').slice(0, 150)}
                        {post.content.replace(/<[^>]+>/g, '').length > 150 ? '...' : ''}
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
      )}

      {tab === 'comments' && (
        <div>
          {comments.length === 0 ? (
            <p className="text-muted" style={{ marginTop: '1rem' }}>There's nothing here.</p>
          ) : (
            <div className="account-posts">
              {comments.map(comment => (
                <div key={comment.id} className="account-post-row">
                  <div className="account-post-left">
                    {comment.post && !comment.post.deleted ? (
                      <Link
                        href={`/posts/${comment.post.id}#comment-${comment.id}`}
                        className="post-title"
                        style={{ fontSize: '0.85rem' }}
                      >
                        on: {comment.post.title}
                      </Link>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                        on: [deleted post]
                      </span>
                    )}
                    {comment.parent && (
                      <a
                        href={comment.post ? `/posts/${comment.post.id}#comment-${comment.parent.id}` : '#'}
                        className="comment-reply-ref"
                      >
                        ↩ replying to @{comment.parent.author?.handle ?? 'Unknown'}
                      </a>
                    )}
                    <span className="post-date">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                    <p className="post-preview" style={{ marginTop: '0.25rem' }}>
                      {comment.content.replace(/<[^>]+>/g, '').slice(0, 120)}
                      {comment.content.replace(/<[^>]+>/g, '').length > 120 ? '...' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}