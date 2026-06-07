'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, requestPasswordResetPublic, resetPasswordPublic } from './actions'

type View = 'login' | 'forgot' | 'reset'

export default function LoginPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('login')

  const [form, setForm] = useState({
    identifier: '',
    password: '',
    pds: 'https://pds.vodkeo.com',
  })

  const [forgotForm, setForgotForm] = useState({
    email: '',
    pds: 'https://pds.vodkeo.com',
  })

  const [resetForm, setResetForm] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
    pds: 'https://pds.vodkeo.com',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function resetMessages() {
    setError('')
    setSuccess('')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetMessages()
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

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetMessages()
    setLoading(true)
    const result = await requestPasswordResetPublic({
      email: forgotForm.email,
      pds: forgotForm.pds,
    })
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setResetForm(prev => ({ ...prev, pds: forgotForm.pds }))
      setView('reset')
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetMessages()
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (resetForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const result = await resetPasswordPublic({
      token: resetForm.token,
      newPassword: resetForm.newPassword,
      pds: resetForm.pds,
    })
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Password reset successfully. You can now log in.')
      setView('login')
      setResetForm({ token: '', newPassword: '', confirmPassword: '', pds: 'https://pds.vodkeo.com' })
    }
  }

  return (
    <div>
      <main className="max-w-5xl mx-auto px-2 py-1">

        {/* Login */}
        {view === 'login' && (
          <>
            <h1 className="text-2xl mb-2">Login</h1>
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
              {success && <p className="form-success">{success}</p>}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => { resetMessages(); setView('forgot') }}
                >
                  Forgot Password
                </button>
              </div>
            </form>
          </>
        )}

        {/* Forgot Password */}
        {view === 'forgot' && (
          <>
            <h1 className="text-2xl mb-2">Reset Password</h1>
            <form onSubmit={handleForgotSubmit} className="signup-form">
              <div className="form-field">
                <label htmlFor="forgot-pds">Server</label>
                <input
                  id="forgot-pds"
                  type="text"
                  value={forgotForm.pds}
                  onChange={e => setForgotForm(p => ({ ...p, pds: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotForm.email}
                  onChange={e => setForgotForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@email.com"
                  required
                />
                <span className="form-hint">
                  A reset token will be sent to this address.
                </span>
              </div>
              {error && <p className="form-error">{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => { resetMessages(); setView('reset') }}
                >
                  Enter Reset Token
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => { resetMessages(); setView('login') }}
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}

        {/* Enter Reset Token */}
        {view === 'reset' && (
          <>
            <h1 className="text-2xl mb-2">Enter Reset Token</h1>
            <form onSubmit={handleResetSubmit} className="signup-form">
              <div className="form-field">
                <label htmlFor="reset-pds">Server</label>
                <input
                  id="reset-pds"
                  type="text"
                  value={resetForm.pds}
                  onChange={e => setResetForm(p => ({ ...p, pds: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="reset-token">Reset Token</label>
                <input
                  id="reset-token"
                  type="text"
                  value={resetForm.token}
                  onChange={e => setResetForm(p => ({ ...p, token: e.target.value }))}
                  placeholder="Enter token from your email"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="reset-newPassword">New Password</label>
                <input
                  id="reset-newPassword"
                  type="password"
                  value={resetForm.newPassword}
                  onChange={e => setResetForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                />
                <span className="form-hint">8+ characters with at least one uppercase letter and one number.</span>
              </div>
              <div className="form-field">
                <label htmlFor="reset-confirmPassword">Confirm New Password</label>
                <input
                  id="reset-confirmPassword"
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={e => setResetForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => { resetMessages(); setView('forgot') }}
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}

      </main>
    </div>
  )
}