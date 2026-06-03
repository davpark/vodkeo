import { getPost } from '@/lib/api';
import Link from 'next/link';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(Number(id));

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">

      <Link href="/" className="nav-link" style={{ paddingLeft: 0 }}>
        ← Back
      </Link>

      <div style={{ marginTop: '2rem' }}>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '2rem', marginBottom: '0.5rem' }}>
          {post.title}
        </h1>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span className="post-date">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {post.authorHandle && (
            <Link href={`/u/${post.authorHandle}`} className="post-author" style={{ textAlign: 'left' }}>
              {post.authorHandle}
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="post-content">
          {post.content}
        </div>

        <div className="mt-4">
          {post.tags && post.tags.length > 0 && (
            <span className="post-tags" style={{ textAlign: 'left' }}>
              {'tags: '}
              <em>{post.tags.join(', ')}</em>
            </span>
          )}
        </div>
        
      </div>
    </main>
  );
}