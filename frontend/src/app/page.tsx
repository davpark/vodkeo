import { getPosts } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/types';
import Navbar from '@/components/Navbar'
import ThemeToggle from '@/components/ThemeToggle'

export default async function HomePage() {
  let posts: Post[] = [];

  try {
    posts = await getPosts();
  } catch (error) {
    console.error('Failed to load posts:', error);
  }

  return (
    <main className="max-w-5xl mx-auto px-2 py-1">
      <Navbar />
      <ThemeToggle />
      {posts.length === 0 ? (
        <p></p>
      ) : (
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article key={post.id} className="border-b pb-8">
              <p className="text-sm text-muted mb-1">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <h2 className="text-2xl font-semibold mb-2">
                <Link href={`/posts/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-muted leading-relaxed">
                {post.content.slice(0, 150)}
                {post.content.length > 150 ? '...' : ''}
              </p>
              <Link
                href={`/posts/${post.id}`}
                className="inline-block mt-4 text-sm font-medium text-accent hover:underline"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}