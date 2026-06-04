import { Post } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPosts(tag?: string, sort?: string): Promise<Post[]> {
  const params = new URLSearchParams()
  if (tag) params.set('tag', tag)
  if (sort) params.set('sort', sort)
  const url = `${API_URL}/api/posts?${params.toString()}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export async function getPost(id: number): Promise<Post> {
  const res = await fetch(`${API_URL}/api/posts/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch post')
  return res.json()
}

export async function getTags(): Promise<{ tag: string; count: number }[]> {
  const res = await fetch(`${API_URL}/api/tags`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}