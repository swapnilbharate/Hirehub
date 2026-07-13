import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserPlus, Mail, Lock, User as UserIcon, Building, MapPin, Briefcase, CheckCircle, Phone, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()

  const [role, setRole] = useState('ROLE_JOBSEEKER') // ROLE_JOBSEEKER or ROLE_RECRUITER
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Recruiter fields
  const [companyName, setCompanyName] = useState('')
  const [companyLocation, setCompanyLocation] = useState('')
  const [position, setPosition] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Password strength meter helper
  const getPasswordStrength = () => {
    if (!password) return { text: '', color: '', percent: 0 }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return { text: 'Weak', color: 'bg-danger', percent: 33 }
    if (score <= 4) return { text: 'Medium', color: 'bg-warning', percent: 66 }
    return { text: 'Strong', color: 'bg-success', percent: 100 }
  }

  const strength = getPasswordStrength()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!termsAccepted) {
      setError('You must accept the Terms of Service & Privacy Policy.')
      return
    }

    setSubmitting(true)

    try {
      await axios.post('/api/auth/register', {
        email,
        password,
        fullName,
        role,
        phone,
        companyName: role === 'ROLE_RECRUITER' ? companyName : null,
        companyLocation: role === 'ROLE_RECRUITER' ? companyLocation : null,
        position: role === 'ROLE_RECRUITER' ? position : null
      })

      setSuccess('Account created successfully! Redirecting to login page...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account. Email might be in use.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-5 animate-fade-in" style={{ background: 'linear-gradient(135deg, var(--bg-section) 0%, var(--bg-primary) 100%)', minHeight: 'calc(100vh - 72px)' }}>
      <div className="card-main p-5 shadow-sm" style={{ width: '100%', maxWidth: '550px', border: '1px solid var(--border-light)' }}>
        <div className="text-center mb-4">
          <UserPlus className="text-primary mb-2" size={40} />
          <h2 className="text-dark fw-bold">Create Account</h2>
          <p className="text-muted fs-7">Join HireHub to start your recruitment journey</p>
        </div>

        {error && <div className="alert alert-danger py-2 fs-7 rounded">{error}</div>}
        {success && (
          <div className="alert alert-success py-2 fs-7 d-flex align-items-center gap-2 rounded">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Role Toggle Selector */}
        <div className="d-flex gap-2 mb-4">
          <button
            type="button"
            className={`btn flex-fill py-2 fw-semibold ${role === 'ROLE_JOBSEEKER' ? 'btn-grad-primary' : 'btn-outline-glass text-dark'}`}
            onClick={() => setRole('ROLE_JOBSEEKER')}
          >
            Job Seeker
          </button>
          <button
            type="button"
            className={`btn flex-fill py-2 fw-semibold ${role === 'ROLE_RECRUITER' ? 'btn-grad-primary' : 'btn-outline-glass text-dark'}`}
            onClick={() => setRole('ROLE_RECRUITER')}
          >
            Recruiter
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted fs-7">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted" style={{ border: '1px solid var(--border-light)' }}><UserIcon size={16} /></span>
              <input
                type="text"
                className="form-control input-main"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted fs-7">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted" style={{ border: '1px solid var(--border-light)' }}><Mail size={16} /></span>
              <input
                type="email"
                className="form-control input-main"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted fs-7">Phone Number</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted" style={{ border: '1px solid var(--border-light)' }}><Phone size={16} /></span>
              <input
                type="text"
                className="form-control input-main"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted fs-7">Password (6+ Characters)</label>
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
            
            {/* Password Strength Meter */}
            {password && (
              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-1 fs-8 text-muted">
                  <span>Password Strength:</span>
                  <span className="fw-bold">{strength.text}</span>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div 
                    className={`progress-bar ${strength.color}`} 
                    role="progressbar" 
                    style={{ width: `${strength.percent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Conditional Recruiter Fields */}
          {role === 'ROLE_RECRUITER' && (
            <div className="border-top border-light pt-3 mt-3 animate-fade-in">
              <h5 className="text-dark fw-bold fs-6 mb-3">Company Details</h5>
              
              <div className="mb-3">
                <label className="form-label text-muted fs-7">Company Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted" style={{ border: '1px solid var(--border-light)' }}><Building size={16} /></span>
                  <input
                    type="text"
                    className="form-control input-main"
                    placeholder="Google Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted fs-7">Company Location</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted" style={{ border: '1px solid var(--border-light)' }}><MapPin size={16} /></span>
                  <input
                    type="text"
                    className="form-control input-main"
                    placeholder="New York, NY"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted fs-7">Your Position / Title</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted" style={{ border: '1px solid var(--border-light)' }}><Briefcase size={16} /></span>
                  <input
                    type="text"
                    className="form-control input-main"
                    placeholder="Lead Technical Recruiter"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Terms and conditions */}
          <div className="form-check my-3 text-start">
            <input 
              type="checkbox" 
              className="form-check-input" 
              id="termsCheck"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label className="form-check-label fs-8 text-muted" htmlFor="termsCheck">
              I agree to the <a href="#" className="text-primary text-decoration-none fw-semibold">Terms of Service</a> & <a href="#" className="text-primary text-decoration-none fw-semibold">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="btn btn-grad-primary w-100 py-2 mt-2" disabled={submitting}>
            {submitting ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-3 fs-7">
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="text-primary text-decoration-none fw-semibold">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
