import { getPosts } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/types';
import ThemeToggle from '@/components/ThemeToggle'
import { getSession } from '@/lib/session'

export default async function HomePage() {
  let posts: Post[] = [];
  const session = await getSession()

  try {
    posts = await getPosts();
  } catch (error) {
    console.error('Failed to load posts:', error);
  }

  return (
    <main className="max-w-5xl mx-auto px-2 py-4">
      <div className="page-top-bar">
        {session && (
          <Link href="/posts/create" className="btn">
            Create Post
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-muted" style={{ marginTop: '2rem' }}>No posts yet.</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <article key={post.id} className="post-card">

              {/* Top row */}
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
                  {post.authorHandle ?? post.author?.name ?? post.author?.email ?? 'Unknown'}
                </Link>
              </div>

              {/* Bottom row */}
              <div className="post-card-bottom">
                <div className="post-card-bottom-left">
                  <p className="post-preview">
                    {post.content.slice(0, 150)}
                    {post.content.length > 150 ? '...' : ''}
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

      {/* Theme toggle — bottom right */}
      <div className="page-bottom-bar">
        <ThemeToggle />
      </div>
    </main>
  );
}