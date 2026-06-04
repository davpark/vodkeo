'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import LogoutButton from './LogoutButton';

function TagsDropdown({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([])
  const router = useRouter()

  useEffect(() => {
    if (isOpen && tags.length === 0) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`)
        .then(r => r.json())
        .then(setTags)
        .catch(() => {})
    }
  }, [isOpen])

  return (
    <div className="dropdown" onClick={(e) => e.stopPropagation()}>
      <button className="nav-link" onClick={onToggle}>
        Tags <span className="dropdown-caret">▾</span>
      </button>
      {isOpen && (
        <div className="dropdown-menu tags-dropdown-menu">
          {tags.length === 0 ? (
            <span className="dropdown-item" style={{ opacity: 0.5 }}>No tags yet</span>
          ) : (
            <>
            {tags.slice(0, 10).map(({ tag, count }) => (
            <button
                key={tag}
                className="dropdown-item tags-dropdown-item"
                onClick={() => {
                router.push(`/?tag=${encodeURIComponent(tag)}`)
                onToggle()
                }}
            >
                <span>{tag}</span>
                <span className="tag-count">{count}</span>
            </button>
            ))}
            <Link
            href="/tags"
            className="dropdown-item"
            style={{ borderTop: '1px solid var(--foreground-muted)', opacity: 0.7 }}
            onClick={onToggle}
            >
            View all tags →
            </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Dropdown({ label, items, isOpen, onToggle }: { 
    label: string
    items: string[]
    isOpen: boolean
    onToggle: () => void
    }) {
    return (
        <div className="dropdown" onClick={(e) => e.stopPropagation()}>
        <button className="nav-link" onClick={onToggle}>
            {label}
        </button>
        {isOpen && (
            <div className="dropdown-menu">
            {items.map((item) => (
                <button key={item} className="dropdown-item" onClick={onToggle}>
                {item}
                </button>
            ))}
            </div>
        )}
        </div>
    )
}

function UserDropdown({ handle }: { handle: string }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClick(e: MouseEvent | TouchEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        document.addEventListener('touchstart', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('touchstart', handleClick)
        }
    }, [])

    return (
        <div className="dropdown" ref={ref}>
            <button className="username" onClick={() => setOpen(prev => !prev)}>
                {handle} <span className="dropdown-caret">▾</span>
            </button>
            {open && (
                <div className="dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '150px' }}>
                    <Link
                        href={`/u/${handle}`}
                        className="dropdown-item"
                        onClick={() => setOpen(false)}
                    >
                        Profile
                    </Link>
                    <Link
                        href="/account"
                        className="dropdown-item"
                        onClick={() => setOpen(false)}
                    >
                        Account Settings
                    </Link>
                    <div style={{ borderTop: '1px solid var(--foreground-muted)' }}>
                        <LogoutButton/>
                    </div>
                </div>
            )}
        </div>
    )
}

function AuthButtons({ isLoggedIn, handle }: { isLoggedIn: boolean; handle?: string }) {
    const pathname = usePathname()

    if (isLoggedIn && handle) {
        return (
            <UserDropdown handle={handle} />
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

interface NavbarProps {
    isLoggedIn?: boolean
    handle?: string
}

export default function Navbar({ isLoggedIn = false, handle }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [scope, setScope] = useState<'all' | 'posts' | 'tags' | 'users'>('all')
    const [scopeOpen, setScopeOpen] = useState(false)
    const navRef = useRef<HTMLElement>(null)
    const scopeRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    function toggleDropdown(name: string) {
        setOpenDropdown(prev => prev === name ? null : name)
    }

    useEffect(() => {
        function handleClick(e: MouseEvent | TouchEvent) {
        // Close dropdowns if clicking outside navbar
        if (navRef.current && !navRef.current.contains(e.target as Node)) {
            setOpenDropdown(null)
            setScopeOpen(false)
        }
        // Close scope if clicking outside scope wrapper
        if (scopeRef.current && !scopeRef.current.contains(e.target as Node)) {
            setScopeOpen(false)
        }
        }

        document.addEventListener('mousedown', handleClick)
        document.addEventListener('touchstart', handleClick)
        return () => {
        document.removeEventListener('mousedown', handleClick)
        document.removeEventListener('touchstart', handleClick)
        }
    }, [])

    function handleSearch(e?: React.FormEvent) {
        e?.preventDefault()
        if (!search.trim()) return
        router.push(`/search?q=${encodeURIComponent(search.trim())}&scope=${scope}`)
        setSearch('')
    }

    return (
        <nav className="navbar" ref={navRef}>
            <div className=" max-w-5xl mx-auto px-2 py-1">
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
                    {/* Desktop auth buttons */}
                    <div className="navbar-auth-desktop">
                        <AuthButtons isLoggedIn={isLoggedIn} handle={handle} />
                    </div>

                    {/* Hamburger */}
                    <button
                        className="navbar-hamburger"
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                    </div>
                </div>

                {/* Bottom row — hidden on mobile unless menu open */}
                <div className={`navbar-bottom ${menuOpen ? 'navbar-bottom-open' : ''}`}>
                    <div className="navbar-bottom-left">
                        <Link href="/news" className="nav-link" onClick={() => setMenuOpen(false)}>News</Link>
                        <TagsDropdown
                            isOpen={openDropdown === 'tags'}
                            onToggle={() => toggleDropdown('tags')}
                        />
                        <button
                            className="nav-link"
                            onClick={async () => {
                                try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/random`)
                                if (res.ok) {
                                    const post = await res.json()
                                    router.push(`/posts/${post.id}`)
                                    setMenuOpen(false)
                                }
                                } catch {}
                            }}
                            >
                            Random
                        </button>
                    </div>

                    <div className="navbar-bottom-right">
                        {/* Scope selector */}
                        <div className="search-scope-wrapper" ref={scopeRef}>
                            <button
                                className="search-scope-btn"
                                onClick={() => setScopeOpen(prev => !prev)}
                            >
                                {scope === 'all' ? 'All' :
                                scope === 'posts' ? 'Posts' :
                                scope === 'tags' ? 'Tags' : 'Users'}
                                <span className="dropdown-caret">▾</span>
                            </button>
                            {scopeOpen && (
                                <div className="search-scope-menu">
                                {(['all', 'posts', 'tags', 'users'] as const).map(s => (
                                    <button
                                    key={s}
                                    className={`dropdown-item ${scope === s ? 'active' : ''}`}
                                    onClick={(e) => {
                                        setScope(s)
                                        setScopeOpen(false)
                                    }}
                                    >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                                </div>
                            )}
                            </div>

                        <input
                            type="search"
                            placeholder="Search..."
                            className="navbar-search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                            if (e.key === 'Enter' && search.trim()) handleSearch()
                            }}
                        />
                        <Link href={`/search?q=${encodeURIComponent(search)}&scope=${scope}`} className="btn search-btn">
                            <svg fill="currentColor" height="15" width="15" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path className="cls-1" d="M13.07336,12.29053,10.14679,9.364a3.9711,3.9711,0,1,0-.78284.78284l2.92658,2.92657Zm-6.064-2.4516A2.82914,2.82914,0,1,1,9.8385,7.00934,2.83286,2.83286,0,0,1,7.00934,9.83893Z"></path>
                            </g>
                            </svg>
                        </Link>
                    </div>

                    {/* Auth buttons inside mobile menu */}
                    <div className="navbar-auth-mobile">
                        <AuthButtons isLoggedIn={isLoggedIn} />
                    </div>
                </div>
            </div>
            
        </nav>
    )
}