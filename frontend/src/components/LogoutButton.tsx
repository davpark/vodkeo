'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/app/login/actions'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="btn">
      Log Out
    </button>
  )
}