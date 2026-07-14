import React, { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../App'
import { LogIn, Mail, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load saved credentials on page load
  useEffect(() => {
    const savedEmail = localStorage.getItem('hirehub_saved_email')
    const savedPassword = localStorage.getItem('hirehub_saved_password')
    const savedRemember = localStorage.getItem('hirehub_remember_me')

    if (savedRemember === 'true' && savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await axios.post('/api/auth/login', { email, password })

      // Save or clear credentials based on Remember Me
      if (rememberMe) {
        localStorage.setItem('hirehub_saved_email', email)
        localStorage.setItem('hirehub_saved_password', password)
        localStorage.setItem('hirehub_remember_me', 'true')
      } else {
        localStorage.removeItem('hirehub_saved_email')
        localStorage.removeItem('hirehub_saved_password')
        localStorage.removeItem('hirehub_remember_me')
      }

      login(
        { 
          email: res.data.email, 
          fullName: res.data.fullName, 
          role: res.data.role,
          profilePhotoUrl: res.data.profilePhotoUrl
        }, 
        res.data.token
      )
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    alert("Reset link features are simulated. Please use: jobseeker1@gmail.com / password or recruiter1@google.com / password.")
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-5 animate-fade-in" style={{ background: 'linear-gradient(135deg, var(--bg-section) 0%, var(--bg-primary) 100%)', minHeight: 'calc(100vh - 72px)' }}>
      <div className="card-main p-5 shadow-sm" style={{ width: '100%', maxWidth: '450px', border: '1px solid var(--border-light)' }}>
        <div className="text-center mb-4">
          <LogIn className="text-primary mb-2" size={40} />
          <h2 className="text-dark fw-bold">Welcome Back</h2>
          <p className="text-muted fs-7">Log in to manage your HireHub recruitment portal</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 fs-7 d-flex align-items-center gap-2 rounded">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted fs-7">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted" style={{ border: '1px solid var(--border-light)' }}><Mail size={16} /></span>
              <input
                type="email"
                className="form-control input-main"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label text-muted fs-7 mb-0">Password</label>
              <a href="#" onClick={handleForgotPassword} className="text-primary text-decoration-none fs-8 fw-semibold">
                Forgot Password?
              </a>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted" style={{ border: '1px solid var(--border-light)' }}><Lock size={16} /></span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control input-main"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="btn bg-light text-muted px-3" style={{ border: '1px solid var(--border-light)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="rememberMeSwitch"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ 
                  width: '2.5em', 
                  height: '1.3em', 
                  cursor: 'pointer',
                  backgroundColor: rememberMe ? 'var(--primary)' : '#dee2e6',
                  borderColor: rememberMe ? 'var(--primary)' : '#dee2e6'
                }}
              />
              <label 
                className="form-check-label text-muted fs-7" 
                htmlFor="rememberMeSwitch"
                style={{ cursor: 'pointer', marginLeft: '4px' }}
              >
                Remember Me
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-grad-primary w-100 py-2 mb-3" disabled={submitting}>
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-3 fs-7">
          <span className="text-muted">Don't have an account? </span>
          <Link to="/register" className="text-primary text-decoration-none fw-semibold">Create Account</Link>
        </div>
      </div>
    </div>
  )
}
