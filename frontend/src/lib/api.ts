import { Post } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/api/posts`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function getPost(id: number): Promise<Post> {
  const res = await fetch(`${API_URL}/api/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}