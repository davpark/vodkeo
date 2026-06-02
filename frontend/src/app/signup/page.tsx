'use client'

import { useState } from 'react'
import { AtpAgent } from '@atproto/api'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    handle: '',
    password: '',
    inviteCode: '',
    pds: 'https://bsky.social',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const agent = new AtpAgent({ service: form.pds })

      await agent.createAccount({
        email: form.email,
        handle: form.handle,
        password: form.password,
        inviteCode: form.inviteCode || undefined,
      })

      router.push('/login')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <main className="max-w-5xl mx-auto px-2 py-1">
        <Navbar />
        <h1 className="text-2xl mb-8">Sign Up</h1>

        <form onSubmit={handleSubmit} className="signup-form">

          <div className="form-field">
            <label htmlFor="pds">Server</label>
            <input
              id="pds"
              name="pds"
              type="text"
              value={form.pds}
              onChange={handleChange}
              placeholder="https://bsky.social"
            />
            <span className="form-hint">Use bsky.social or your own PDS</span>
          </div>

          <div className="form-field">
            <label htmlFor="handle">Handle</label>
            <input
              id="handle"
              name="handle"
              type="text"
              value={form.handle}
              onChange={handleChange}
              placeholder="you.bsky.social"
              required
            />
            <span className="form-hint">Your AT Protocol handle</span>
          </div>

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
          </div>

          <div className="form-field">
            <label htmlFor="inviteCode">Invite Code</label>
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              value={form.inviteCode}
              onChange={handleChange}
              placeholder="Optional — required on some servers"
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