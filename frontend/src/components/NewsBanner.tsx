'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { dismissNewsPost } from '@/app/actions'
import { Post } from '@/types'

export default function NewsBanner({ post, isLoggedIn }: { post: Post; isLoggedIn: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    setSubscribed(localStorage.getItem('news_subscribed') === 'true')
  }, [])

  if (dismissed) return null

  async function handleDismiss() {
    setDismissed(true)
    await dismissNewsPost(post.id)
  }

  function handleSubscribe() {
    const next = !subscribed
    setSubscribed(next)
    localStorage.setItem('news_subscribed', String(next))
  }

   return (
    <div className="news-banner-container">
      <div className={`news-banner${minimized ? ' news-banner--minimized' : ''}${minimized && !isLoggedIn ? ' news-banner--minimized-guest' : ''}`}>
        <div className="news-banner-header">
          {/* <span className="news-banner-label">News</span> */}
          <div className="news-banner-controls">
            <button
              className="news-banner-ctrl-btn"
              onClick={() => setMinimized(prev => !prev)}
              aria-label={minimized ? 'Expand' : 'Minimize'}
            >
              {minimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                </svg>
              )}
            </button>
            {isLoggedIn && (
              <button className="news-banner-ctrl-btn" onClick={handleDismiss} aria-label="Dismiss">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="news-banner-body">
          <div className="news-banner-body-inner">
            <Link href={`/posts/${post.id}`} className="news-banner-title">
              {post.title}
              <span className="post-date ml-3">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </Link>

            <p className="news-banner-preview">
              {post.content.replace(/<[^>]+>/g, '').slice(0, 220)}{post.content.length > 220 ? '...' : ''}
            </p>

            <div className="news-banner-footer">
              <Link href={`/posts/${post.id}`} className="news-banner-read">
                Read more →
              </Link>
              <button className="btn" onClick={handleSubscribe}>
                {subscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}