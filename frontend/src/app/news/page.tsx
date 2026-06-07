import { getSession } from '@/lib/session'
import { getPosts } from '@/lib/api'
import NewsClient from './NewsClient'

export default async function NewsPage() {
  const session = await getSession()

  let isAdmin = false
  if (session) {
    try {
      const res = await fetch(`${process.env.BACKEND_URL}/api/admin/me?did=${session.did}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        isAdmin = data.isAdmin
      }
    } catch {}
  }

  const posts = await getPosts('news').catch(() => [])

  return (
    <main className="max-w-5xl mx-auto px-2 py-4">
      <NewsClient isAdmin={isAdmin} posts={posts} />
    </main>
  )
}
