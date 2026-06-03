'use client'

import { useState } from 'react'
import { AtpAgent } from '@atproto/api'
import { useRouter } from 'next/navigation'

type Provider = 'vodkeo' | 'bluesky' | 'custom'

const PROVIDERS: Record<Provider, string> = {
    vodkeo: 'https://pds.vodkeo.com',
    bluesky: 'https://bsky.social',
    custom: '',
}

const RESERVED_USERNAMES = [
    'admin', 'root', 'vodkeo', 'www', 'pds', 'api', 'mail',
    'support', 'help', 'mod', 'moderator', 'staff', 'system',
    'official', 'contact', 'info', 'news', 'search', 'account',
]

function ageCheck(birthday: string): boolean {
  const today = new Date()
  const birth = new Date(birthday)
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18
  }
  return age >= 18
}

export default function SignupPage() {
    const router = useRouter()
    const [provider, setProvider] = useState<Provider>('vodkeo')
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        inviteCode: '',
        customPds: '',
        birthday: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function validateForm(): string | null {
        // Username
        if (form.username.length < 3) 
            return 'Username must be at least 3 characters.'
        if (form.username.length > 18) 
            return 'Username must be 18 characters or fewer.'
        if (!/^[a-z0-9-]+$/.test(form.username)) 
            return 'Username can only contain lowercase letters, numbers, and hyphens.'
        if (form.username.startsWith('-') || form.username.endsWith('-')) 
            return 'Username cannot start or end with a hyphen.'
        if (RESERVED_USERNAMES.includes(form.username)) 
            return 'That username is reserved.'

        // Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) 
            return 'Please enter a valid email address.'

        // Password
        if (form.password.length < 8) 
            return 'Password must be at least 8 characters.'
        if (form.password.length > 128) 
            return 'Password must be 128 characters or fewer.'
        if (!/[A-Z]/.test(form.password)) 
            return 'Password must contain at least one uppercase letter.'
        if (!/[a-z]/.test(form.password)) 
            return 'Password must contain at least one lowercase letter.'
        if (!/[0-9]/.test(form.password)) 
            return 'Password must contain at least one number.'

        // Confirm password
        if (form.password !== form.confirmPassword) 
            return 'Passwords do not match.'

        if (!form.birthday)
            return 'Date of birth is required.'
        if (!ageCheck(form.birthday))
            return 'You must be at least 18 years old to sign up.'

        return null
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function getPds() {
        if (provider === 'custom') return form.customPds
        return PROVIDERS[provider]
    }

    function getHandle() {
        if (provider === 'vodkeo') return `${form.username}.vodkeo.com`
        if (provider === 'bluesky') return `${form.username}.bsky.social`
        return form.username
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (getPds() !== 'https://pds.vodkeo.com') {
            setError('Only Vodkeo accounts are supported at this time.')
            return
        }

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setLoading(true)

        try {
            const agent = new AtpAgent({ service: getPds() })
            const result = await agent.createAccount({
                email: form.email,
                handle: getHandle(),
                password: form.password,
                inviteCode: form.inviteCode || undefined,
            })

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                did: result.data.did,
                handle: getHandle(),
                birthday: form.birthday,
                }),
            })

            router.push('/login')
            } catch (err: unknown) {
                if (err instanceof Error) {
                    if (err.message.toLowerCase().includes('handle') || 
                        err.message.toLowerCase().includes('taken') ||
                        err.message.toLowerCase().includes('already exists')) {
                    setError('That username has already been taken.')
                    } else {
                    setError(err.message)
                    }
                } else {
                    setError('Something went wrong. Please try again.')
                }
            } finally {
            setLoading(false)
            }
        }

    return (
        <div>
            <main className="max-w-5xl mx-auto px-2 py-12">
                <div className="invite-only-banner mb-3">
                    Currently Invite Only
                </div>
                {/* <div className="mb-8">Sign Up</div> */}

                <form onSubmit={handleSubmit} className="signup-form">

                {/* Account Provider */}
                <div className="form-field">
                    <label>Account Provider</label>
                    <div className="provider-selector">
                        {(['vodkeo', 'bluesky', 'custom'] as Provider[]).map((p) => (
                        <button
                            key={p}
                            type="button"
                            className={`provider-btn ${provider === p ? 'active' : ''} ${p !== 'vodkeo' ? 'disabled' : ''}`}
                            onClick={() => p === 'vodkeo' && setProvider(p)}
                            disabled={p !== 'vodkeo'}
                            title={p !== 'vodkeo' ? 'Currently unavailable' : undefined}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                        ))}
                    </div>
                </div>

                {/* Custom PDS input */}
                {provider === 'custom' && (
                    <div className="form-field">
                    <label htmlFor="customPds">Server Address</label>
                    <input
                        id="customPds"
                        name="customPds"
                        type="text"
                        value={form.customPds}
                        onChange={handleChange}
                        placeholder="https://pds.yourdomain.com"
                        required
                    />
                    </div>
                )}

                {/* Username */}
                <div className="form-field">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="yourname"
                        required
                    />
                    <span className="form-hint">
                        3–18 characters. Lowercase letters, numbers, and hyphens only.
                    </span>
                    {provider !== 'custom' && form.username && (
                    <span className="form-hint">
                        Your handle will be @{getHandle()}
                    </span>
                    )}
                </div>

                {/* Email */}
                <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    />
                </div>

                {/* Password */}
                <div className="form-field">
                    <label htmlFor="password">Password</label>
                    <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    />
                    <span className="form-hint">
                        8+ characters with at least one uppercase letter and one number.
                    </span>
                </div>

                {/* Confirm Password */}
                <div className="form-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    />
                </div>

                {/* Birthday */}
                <div className="form-field">
                    <label htmlFor="birthday">Date of Birth</label>
                    <input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={form.birthday}
                    onChange={handleChange}
                    required
                    />
                    <span className="form-hint">
                    You must be at least 18 years old to sign up.
                    </span>
                </div>

                <div className="form-field">
                    <label htmlFor="inviteCode">Invite Code</label>
                    <input
                        id="inviteCode"
                        name="inviteCode"
                        type="text"
                        value={form.inviteCode}
                        onChange={handleChange}
                        placeholder={
                        provider === 'vodkeo' ? 'Required' :
                        provider === 'bluesky' ? 'Required for bsky.social' :
                        'Optional'
                        }
                    />
                </div>

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>

                </form>
            </main>
        </div>
    )
}