'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

function Dropdown({ label, items }: { label: string; items: string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="nav-link">
        {label}
      </button>
      {open && (
        <div className="dropdown-menu">
          {items.map((item) => (
            <button key={item} className="dropdown-item">{item}</button>
          ))}
        </div>
      )}
    </div>
  )
}

function useAuth() {
  const isLoggedIn = false // replace with real auth state
  return { isLoggedIn }
}

function AuthButtons() {
  const { isLoggedIn } = useAuth()
  const pathname = usePathname()

  if (isLoggedIn) {
    return (
      <>
        <Link href="/account" className="btn">Account</Link>
        <button className="btn">Log Out</button>
      </>
    )
  }

  return (
    <>
      {pathname !== '/login' && (
        <Link href="/login" className="btn">Login</Link>
      )}
      {pathname !== '/signup' && (
        <Link href="/signup" className="btn">Sign Up</Link>
      )}
    </>
  )
}

export default function Navbar() {
    const pathname = usePathname()

    return (
        <nav className="navbar">

        {/* Top row */}
        <div className="navbar-top">
            <Link href="/" className="navbar-brand mixed-text">
            <span>Vod</span>
            <span lang="ko" className="jamo-split">
                <span>ㅋ</span>
                <span>ㅓ</span>
            </span>
            </Link>

            <div className="navbar-top-right">
                {/* {pathname !== '/login' && (
                    <Link href="/login" className="btn">Login</Link>
                )}
                {pathname !== '/signup' && (
                    <Link href="/signup" className="btn">Sign Up</Link>
                )} */}
                <AuthButtons />
            </div>
        </div>

        {/* Bottom row */}
        <div className="navbar-bottom">
            <div className="navbar-bottom-left">
            <Link href="/news" className="nav-link">News</Link>
            <Dropdown label="Sort By" items={['Popular', 'Most Recent']} />
            <Dropdown label="Tags" items={['Coming soon']} />
            <button className="nav-link">Random</button>
            </div>

            <div className="navbar-bottom-right">
            <input
                type="search"
                placeholder="Search..."
                className="navbar-search"
            />
            <Link href="/search" className="btn">Search</Link>
            </div>
        </div>

        </nav>
    )
}