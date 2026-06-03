'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from './actions'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    identifier: '',
    password: '',
    pds: 'https://pds.vodkeo.com',
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
      const result = await login(form)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <main className="max-w-5xl mx-auto px-2 py-1">
        <h1 className="text-2xl mb-8">Login</h1>

        <form onSubmit={handleSubmit} className="signup-form">

          <div className="form-field">
            <label htmlFor="pds">Server</label>
            <input
              id="pds"
              name="pds"
              type="text"
              value={form.pds}
              onChange={handleChange}
            />
            <span className="form-hint">Your PDS server</span>
          </div>

          <div className="form-field">
            <label htmlFor="identifier">Handle or Email</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              value={form.identifier}
              onChange={handleChange}
              placeholder="vodkeo.com or you@email.com"
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

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>
      </main>
    </div>
  )
}