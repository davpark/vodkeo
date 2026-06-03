'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AtpSession } from '@/lib/session'
import { changePassword, changeEmail, deleteAccount, requestPasswordReset } from './actions'

interface Post {
  id: number
  title: string
  createdAt: string
  status: string
  tags: string[]
}

interface Profile {
  did: string
  handle: string
  birthday: string
  createdAt: string
}

interface Props {
  session: AtpSession
  profile: Profile | null
  posts: Post[]
}

export default function AccountClient({ session, profile, posts }: Props) {
    const router = useRouter()
    const [section, setSection] = useState<'info' | 'password' | 'email' | 'posts' | 'delete'>('info')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [passwordForm, setPasswordForm] = useState({
        token: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [tokenSent, setTokenSent] = useState(false)

    const [emailForm, setEmailForm] = useState({
        newEmail: '',
        password: '',
    })

    function resetMessages() {
        setError('')
        setSuccess('')
    }

    async function handlePasswordChange(e: React.FormEvent) {
        e.preventDefault()
        resetMessages()

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('New passwords do not match.')
        return
        }
        if (passwordForm.newPassword.length < 8) {
        setError('Password must be at least 8 characters.')
        return
        }

        setLoading(true)
        const result = await changePassword({
            token: passwordForm.token,
            newPassword: passwordForm.newPassword,
        })
        setLoading(false)

        if (result?.error) {
            setError(result.error)
        } else {
            setSuccess('Password updated successfully.')
            setPasswordForm({ token: '', newPassword: '', confirmPassword: '' })
            setTokenSent(false)
        }
    }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    resetMessages()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    const result = await changeEmail({
      newEmail: emailForm.newEmail,
      password: emailForm.password,
    })
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Email updated successfully.')
      setEmailForm({ newEmail: '', password: '' })
    }
  }

  async function handleDeleteAccount() {
    resetMessages()
    setLoading(true)
    const result = await deleteAccount()
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-2 py-12">
      <h1 className="text-2xl mb-8">Account</h1>

      {/* Section tabs */}
      <div className="account-tabs">
        {(['info', 'email', 'posts', 'delete'] as const).map((s) => (
          <button
            key={s}
            className={`account-tab ${section === s ? 'active' : ''}`}
            onClick={() => { setSection(s); resetMessages() }}
          >
            {s === 'info' ? 'Profile' :
            //  s === 'password' ? 'Change Password' :
             s === 'email' ? 'Change Email' :
             s === 'posts' ? 'Your Posts' :
             'Delete Account'}
          </button>
        ))}
      </div>

      <div className="account-content">

        {/* Profile Info */}
        {section === 'info' && (
          <div className="account-section">
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Handle</span>
                <span className="info-value">@{session.handle}</span>
              </div>
              <div className="info-row">
                <span className="info-label">DID</span>
                <span className="info-value info-did">{session.did}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Change Password */}
        {section === 'password' && (
            <div className="account-section">
                {!tokenSent ? (
                <div>
                    <p className="form-hint" style={{ marginBottom: '1rem' }}>
                    A reset token will be sent to your registered email address.
                    </p>
                    {error && <p className="form-error">{error}</p>}
                    <button
                    className="btn"
                    disabled={loading}
                    onClick={async () => {
                        setLoading(true)
                        resetMessages()
                        const result = await requestPasswordReset()
                        setLoading(false)
                        if (result?.error) {
                        setError(result.error)
                        } else {
                        setTokenSent(true)
                        }
                    }}
                    >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                    </button>
                </div>
                ) : (
                <form onSubmit={handlePasswordChange} className="signup-form">
                    <div className="form-field">
                    <label htmlFor="token">Reset Token</label>
                    <input
                        id="token"
                        type="text"
                        value={passwordForm.token}
                        onChange={e => setPasswordForm(p => ({ ...p, token: e.target.value }))}
                        placeholder="Enter token from your email"
                        required
                    />
                    </div>
                    <div className="form-field">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                        required
                    />
                    <span className="form-hint">8+ characters with at least one uppercase letter and one number.</span>
                    </div>
                    <div className="form-field">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        required
                    />
                    </div>
                    {error && <p className="form-error">{error}</p>}
                    {success && <p className="form-success">{success}</p>}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button type="button" className="btn" onClick={() => setTokenSent(false)}>
                        Back
                    </button>
                    </div>
                </form>
                )}
            </div>
            )}

        {/* Change Email */}
        {section === 'email' && (
          <div className="account-section">
            <form onSubmit={handleEmailChange} className="signup-form">
              <div className="form-field">
                <label htmlFor="newEmail">New Email</label>
                <input
                  id="newEmail"
                  type="email"
                  value={emailForm.newEmail}
                  onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="emailPassword">Current Password</label>
                <input
                  id="emailPassword"
                  type="password"
                  value={emailForm.password}
                  onChange={e => setEmailForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              {success && <p className="form-success">{success}</p>}
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </div>
        )}

        {/* Your Posts */}
        {section === 'posts' && (
          <div className="account-section">
            {posts.length === 0 ? (
              <p className="text-muted">You haven't posted anything yet.</p>
            ) : (
              <div className="account-posts">
                {posts.map(post => (
                  <div key={post.id} className="account-post-row">
                    <div className="account-post-left">
                      <Link href={`/posts/${post.id}`} className="post-title">
                        {post.title}
                      </Link>
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="account-post-right">
                      <Link href={`/posts/${post.id}/edit`} className="btn">Edit</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Account */}
        {section === 'delete' && (
          <div className="account-section">
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              This will permanently delete your account and all your posts. This cannot be undone.
            </p>
            {error && <p className="form-error">{error}</p>}
            <button
              className="btn btn-danger"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        )}

      </div>
    </main>
  )
}