import { getValidSession } from '@/lib/refreshSession'
import { redirect } from 'next/navigation'
import AccountClient from './AccountClient'

export default async function AccountPage() {
    const session = await getValidSession()

    if (!session) {
        redirect('/login')
    }

  // Fetch UserProfile from database
    const profileRes = await fetch(
        `${process.env.BACKEND_URL}/api/users?did=${encodeURIComponent(session.did)}`
    )
    const profile = profileRes.ok ? await profileRes.json() : null

    // Fetch user's posts
    const postsRes = await fetch(
        `${process.env.BACKEND_URL}/api/users/posts?did=${encodeURIComponent(session.did)}`
    )
    
    const posts = postsRes.ok ? await postsRes.json() : []

    return (
        <AccountClient
        session={session}
        profile={profile}
        posts={posts}
        />
    )
}