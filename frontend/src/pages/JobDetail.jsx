import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../App'
import { 
  MapPin, Briefcase, DollarSign, Award, Calendar, Building2, 
  ArrowLeft, ArrowRight, LogIn, Users, Clock, Globe, Heart
} from 'lucide-react'

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState('')
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/jobs/${id}`)
      setJob(res.data)
    } catch (err) {
      console.error('Failed to load job', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'ROLE_JOBSEEKER') {
      setApplyError('Only Job Seekers can apply to jobs.')
      return
    }
    setApplying(true)
    setApplyError('')
    setApplySuccess('')

    try {
      await axios.post(`/api/applications/apply/${job.id}`, null, {
        params: { coverLetter }
      })
      setApplySuccess('Application submitted successfully! The recruiter has been notified.')
      setCoverLetter('')
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to apply. You might have already applied.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-3 fs-7">Loading job details...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-5">
        <h4 className="text-dark fw-bold">Job Not Found</h4>
        <p className="text-muted fs-7">This job listing may have been removed or doesn't exist.</p>
        <button className="btn btn-grad-primary mt-2" onClick={() => navigate('/')}>
          <ArrowLeft size={16} className="me-2" /> Back to Jobs
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button 
        className="btn btn-outline-glass d-inline-flex align-items-center gap-2 mb-4 px-3 py-2"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="row g-4">
        {/* Left Column — Main Content */}
        <div className="col-lg-8">
          {/* Header Card */}
          <div className="card-main overflow-hidden mb-4" style={{ border: '1px solid var(--border-light)' }}>
            {/* Banner */}
            <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #475569 100%)', padding: '32px 32px 28px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white rounded-3 p-2 shadow-sm flex-shrink-0" style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={job.company?.logoUrl || '/images/companies/default-company.png'} 
                    alt="Logo" 
                    style={{ maxHeight: '48px', maxWidth: '48px' }} 
                    onError={(e) => { e.target.src = '/images/companies/default-company.png' }} 
                  />
                </div>
                <div>
                  <h3 className="fw-bold text-white mb-1">{job.title}</h3>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <Link to={`/companies/${job.company?.id}`} className="text-white text-decoration-none fw-semibold" style={{ opacity: 0.95 }}>
                      {job.company?.name}
                    </Link>
                    <span className="text-white" style={{ opacity: 0.4 }}>|</span>
                    <span className="text-white d-flex align-items-center gap-1" style={{ opacity: 0.85, fontSize: '0.9rem' }}>
                      <MapPin size={14} /> {job.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tags Bar */}
            <div className="d-flex flex-wrap gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-section)' }}>
              <span className="d-flex align-items-center gap-1 text-muted fs-7">
                <Briefcase size={14} className="text-primary" /> {job.jobType.replace('_', ' ')}
              </span>
              <span className="d-flex align-items-center gap-1 text-muted fs-7">
                <MapPin size={14} className="text-primary" /> {job.location}
              </span>
              {job.salaryRange && (
                <span className="d-flex align-items-center gap-1 text-muted fs-7">
                  <DollarSign size={14} className="text-success" /> {job.salaryRange}
                </span>
              )}
              <span className="d-flex align-items-center gap-1 text-muted fs-7">
                <Calendar size={14} className="text-primary" /> {job.postedAt ? new Date(job.postedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently posted'}
              </span>
            </div>
          </div>

          {/* Job Description Card */}
          <div className="card-main p-4 mb-4 bg-white" style={{ border: '1px solid var(--border-light)' }}>
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Briefcase size={18} className="text-primary" /> About the Role
            </h5>
            <p className="text-body fs-7" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
              {job.description}
            </p>
          </div>

          {/* Skills & Requirements Card */}
          <div className="card-main p-4 mb-4 bg-white" style={{ border: '1px solid var(--border-light)' }}>
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Award size={18} className="text-primary" /> Skills & Qualifications
            </h5>
            <div className="d-flex flex-wrap gap-2">
              {job.requirements && job.requirements.split(',').map((req, idx) => (
                <span key={idx} className="badge-skill">{req.trim()}</span>
              ))}
            </div>
          </div>

          {/* Apply Section Card */}
          <div className="card-main p-4 bg-white" style={{ border: '1px solid var(--border-light)' }}>
            <h5 className="fw-bold text-dark mb-3">Apply for this Position</h5>

            {applySuccess && <div className="alert alert-success py-2 fs-7 rounded">{applySuccess}</div>}
            {applyError && <div className="alert alert-danger py-2 fs-7 rounded">{applyError}</div>}
            
            {user ? (
              user.role === 'ROLE_JOBSEEKER' ? (
                <form onSubmit={handleApply}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark fs-7">Cover Letter / Pitch</label>
                    <textarea 
                      className="form-control input-main w-100" 
                      rows="4" 
                      placeholder="Tell the hiring team why you're a great fit for this role..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-grad-primary px-5 py-2" disabled={applying}>
                    {applying ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </form>
              ) : (
                <div className="alert alert-info py-2 fs-7 text-center mb-0 rounded">
                  Log in as a Job Seeker to apply to this vacancy.
                </div>
              )
            ) : (
              <div className="text-center py-3">
                <p className="text-muted fs-7 mb-3">You need to be logged in as a Job Seeker to apply.</p>
                <button className="btn btn-grad-primary px-5 py-2" onClick={() => navigate('/login')}>
                  <LogIn size={16} className="me-2" /> Log In to Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Sidebar */}
        <div className="col-lg-4">
          {/* Quick Facts Card */}
          <div className="card-main p-4 mb-4 bg-white" style={{ border: '1px solid var(--border-light)' }}>
            <h6 className="fw-bold text-dark mb-3">Job Overview</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-3 d-flex align-items-start gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <Briefcase size={18} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="fw-semibold text-dark fs-7">Job Type</div>
                  <div className="text-muted fs-7">{job.jobType.replace('_', ' ')}</div>
                </div>
              </li>
              <li className="mb-3 d-flex align-items-start gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="fw-semibold text-dark fs-7">Location</div>
                  <div className="text-muted fs-7">{job.location}</div>
                </div>
              </li>
              {job.salaryRange && (
                <li className="mb-3 d-flex align-items-start gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <DollarSign size={18} className="text-success mt-1 flex-shrink-0" />
                  <div>
                    <div className="fw-semibold text-dark fs-7">Salary Range</div>
                    <div className="text-muted fs-7">{job.salaryRange}</div>
                  </div>
                </li>
              )}
              <li className="d-flex align-items-start gap-3">
                <Calendar size={18} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="fw-semibold text-dark fs-7">Posted On</div>
                  <div className="text-muted fs-7">{job.postedAt ? new Date(job.postedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Company Card */}
          <div className="card-main p-4 bg-white" style={{ border: '1px solid var(--border-light)' }}>
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Building2 size={16} className="text-primary" /> About {job.company?.name}
            </h6>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-light rounded-3 p-2 flex-shrink-0" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                <img 
                  src={job.company?.logoUrl || '/images/companies/default-company.png'} 
                  alt="Logo" 
                  style={{ maxHeight: '36px', maxWidth: '36px' }} 
                  onError={(e) => { e.target.src = '/images/companies/default-company.png' }} 
                />
              </div>
              <div>
                <div className="fw-semibold text-dark">{job.company?.name}</div>
                {job.company?.industry && <div className="text-muted fs-8">{job.company.industry}</div>}
              </div>
            </div>
            <p className="text-muted fs-8 mb-3" style={{ lineHeight: '1.6' }}>
              {job.company?.description ? job.company.description.substring(0, 200) + (job.company.description.length > 200 ? '...' : '') : 'A leading company in its industry, committed to innovation and excellence.'}
            </p>
            <Link 
              to={`/companies/${job.company?.id}`} 
              className="btn btn-outline-glass w-100 d-flex align-items-center justify-content-center gap-2 py-2"
            >
              View Company Profile <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
