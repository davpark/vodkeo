import { Post, TopPost } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPosts(tag?: string, sort?: string): Promise<Post[]> {
  const params = new URLSearchParams()
  if (tag) params.set('tag', tag)
  if (sort) params.set('sort', sort)
  const url = `${API_URL}/api/posts?${params.toString()}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch posts')
  const data = await res.json()
  return data.map((p: any) => ({ ...p, commentCount: p._count?.comments ?? 0 }))
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

export async function getTopPosts(): Promise<TopPost[]> {
  const res = await fetch(`${API_URL}/api/posts/top`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data.map((p: any) => ({ ...p, commentCount: p._count?.comments ?? 0 }))
}

export async function getStats(): Promise<{ postCount: number; tagCount: number }> {
  const [posts, tags] = await Promise.all([
    fetch(`${API_URL}/api/posts`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    fetch(`${API_URL}/api/tags`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
  ])
  return { postCount: posts.length, tagCount: tags.length }
}