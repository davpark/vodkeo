'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton';

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

function AuthButtons({ isLoggedIn }: { isLoggedIn: boolean }) {
    const pathname = usePathname()

    if (isLoggedIn) {
        return (
        <>
            <Link href="/account" className="btn">Account</Link>
            <LogoutButton />
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

interface NavbarProps {
    isLoggedIn?: boolean
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    function toggleDropdown(name: string) {
        setOpenDropdown(prev => prev === name ? null : name)
    }

    useEffect(() => {
        function handleClick() {
            setOpenDropdown(null)
        }

        document.addEventListener('mousedown', handleClick)
        document.addEventListener('touchstart', handleClick)

        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('touchstart', handleClick)
        }
    }, [])

    return (
        <nav className="navbar max-w-5xl mx-auto px-2 py-1">

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
                    <AuthButtons isLoggedIn={isLoggedIn} />
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
                    <Dropdown
                        label="Sort By"
                        items={['Popular', 'Most Recent']}
                        isOpen={openDropdown === 'sortby'}
                        onToggle={() => toggleDropdown('sortby')}
                    />
                    <Dropdown
                        label="Tags"
                        items={['Coming soon']}
                        isOpen={openDropdown === 'tags'}
                        onToggle={() => toggleDropdown('tags')}
                    />
                    <button className="nav-link">Random</button>
                </div>

                <div className="navbar-bottom-right">
                    <input
                        type="search"
                        placeholder="Search..."
                        className="navbar-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && search.trim()) {
                            window.location.href = `/search?q=${encodeURIComponent(search.trim())}`
                            }
                        }}
                    />
                    <Link href="/search" className="btn ml-3">Search</Link>
                </div>

                {/* Auth buttons inside mobile menu */}
                <div className="navbar-auth-mobile">
                    <AuthButtons isLoggedIn={isLoggedIn} />
                </div>
            </div>

        </nav>
    )
}