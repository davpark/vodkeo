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
      <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">
        ← Back to all posts
      </Link>
      <p className="text-sm text-gray-400 mb-2">
        {new Date(post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      {post.author && (
        <p className="text-gray-500 mb-8">By {post.author.name ?? post.author.email}</p>
      )}
      <div className="prose prose-gray max-w-none leading-relaxed text-gray-700">
        {post.content}
      </div>
    </main>
  );
}