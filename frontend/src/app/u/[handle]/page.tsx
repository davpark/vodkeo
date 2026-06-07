import { notFound } from 'next/navigation'
import ProfileTabs from './ProfileTabs'

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
  tags: string[]
}

interface Profile {
  did: string
  handle: string
  createdAt: string
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

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params

  const profileRes = await fetch(`${process.env.BACKEND_URL}/api/u/${handle}`)
  if (!profileRes.ok) notFound()

  const profile: Profile = await profileRes.json()

  const [postsRes, commentsRes] = await Promise.all([
    fetch(`${process.env.BACKEND_URL}/api/users/posts?did=${encodeURIComponent(profile.did)}`),
    fetch(`${process.env.BACKEND_URL}/api/users/comments?did=${encodeURIComponent(profile.did)}`),
  ])

  const posts: Post[] = postsRes.ok ? await postsRes.json() : []
  const comments: UserComment[] = commentsRes.ok ? await commentsRes.json() : []

  return (
    <main className="max-w-5xl mx-auto px-2 py-12">
      <div className="profile-header">
        <h1 className="text-2xl">@{profile.handle}</h1>
        <span className="form-hint">
          Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </span>
      </div>

      <ProfileTabs posts={posts} comments={comments} />
    </main>
  )
}