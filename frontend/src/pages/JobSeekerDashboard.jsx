import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../App'
import { Link } from 'react-router-dom'
import { 
  FileText, Plus, Trash2, CheckCircle, Clock, Calendar, 
  CheckSquare, Sparkles, X, Heart, Briefcase, MapPin, DollarSign, User
} from 'lucide-react'

export default function JobSeekerDashboard() {
  const { user } = useContext(AuthContext)
  
  const [activeTab, setActiveTab] = useState('applications') // applications, saved, recommended, profile
  const [applications, setApplications] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [resumes, setResumes] = useState([])
  const [skills, setSkills] = useState([])
  const [profileDetail, setProfileDetail] = useState(null)
  
  const [newSkill, setNewSkill] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      const [appRes, resumeRes, skillRes, savedRes, recRes, profileRes] = await Promise.all([
        axios.get('/api/applications/my-applications'),
        axios.get('/api/users/profile/resumes'),
        axios.get('/api/users/profile/skills'),
        axios.get('/api/jobs/saved'),
        axios.get('/api/jobs/recommended'),
        axios.get('/api/users/profile/details')
      ])
      setApplications(appRes.data)
      setResumes(resumeRes.data)
      setSkills(skillRes.data)
      setSavedJobs(savedRes.data)
      setRecommendedJobs(recRes.data)
      setProfileDetail(profileRes.data.user)
    } catch (err) {
      console.error("Dashboard load failed", err)
      setError("Failed to fetch dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    try {
      const res = await axios.post('/api/users/profile/skills', null, {
        params: { skillName: newSkill.trim() }
      })
      setSkills(res.data)
      setNewSkill('')
      setSuccess('Skill added successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Failed to add skill.')
    }
  }

  const handleRemoveSkill = async (skillId) => {
    try {
      const res = await axios.delete(`/api/users/profile/skills/${skillId}`)
      setSkills(res.data)
      setSuccess('Skill removed.')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Failed to remove skill.')
    }
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('/api/users/profile/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResumes([res.data, ...resumes])
      setSuccess('Resume uploaded and parsed successfully by AI!')
      setFile(null)
      document.getElementById('resumeFileInput').value = ''
    } catch (err) {
      setError(err.response?.data || 'Failed to upload resume.')
    } finally {
      setUploading(false)
    }
  }

  const handleUnsaveJob = async (jobId) => {
    try {
      await axios.delete(`/api/jobs/${jobId}/save`)
      setSavedJobs(savedJobs.filter(j => j.id !== jobId))
      setSuccess('Job bookmark removed')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('Failed to remove bookmark.')
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SHORTLISTED': return 'badge-status-shortlisted';
      case 'INTERVIEW_SCHEDULED': return 'badge-status-interview';
      case 'REJECTED': return 'badge-status-rejected';
      default: return 'badge-status-applied';
    }
  }

  const latestResume = resumes[0] || null

  return (
    <div className="animate-fade-in text-dark">
      {/* Seeker Profile Card Header Quickview */}
      <div className="card-main p-4 mb-4 shadow-sm bg-white">
        <div className="d-flex align-items-center gap-3 flex-wrap flex-md-nowrap">
          <img 
            src={profileDetail?.profilePhotoUrl || '/images/avatars/default-avatar.png'} 
            className="rounded-circle border" 
            style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
            alt="Avatar"
            onError={(e) => { e.target.src = '/images/avatars/default-avatar.png' }}
          />
          <div>
            <h3 className="fw-bold mb-0 text-dark">{profileDetail?.fullName || user?.fullName}</h3>
            <p className="text-primary fw-medium mb-1 fs-6">{profileDetail?.headline || 'Job Seeker'}</p>
            <Link to="/profile" className="btn btn-sm btn-outline-primary-custom d-inline-flex align-items-center gap-1 mt-1">
              <User size={14} /> View Professional Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Upper overview stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card-main p-4 text-center bg-white shadow-sm stat-card-indigo">
            <h6 className="text-muted mb-1 fs-7 fw-semibold text-uppercase">Total Applications</h6>
            <h2 className="display-6 fw-bold text-gradient">{applications.length}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-main p-4 text-center bg-white shadow-sm stat-card-teal">
            <h6 className="text-muted mb-1 fs-7 fw-semibold text-uppercase">Latest Resume Rating</h6>
            <h2 className="display-6 fw-bold text-gradient">
              {latestResume ? `${latestResume.aiScore}/100` : 'N/A'}
            </h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-main p-4 text-center bg-white shadow-sm stat-card-purple">
            <h6 className="text-muted mb-1 fs-7 fw-semibold text-uppercase">Skills Profile</h6>
            <h2 className="display-6 fw-bold text-gradient">{skills.length}</h2>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="tab-pills-custom mb-4">
        <button 
          className={`tab-pill ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications Tracker
        </button>
        <button 
          className={`tab-pill ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Jobs ({savedJobs.length})
        </button>
        <button 
          className={`tab-pill ${activeTab === 'recommended' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommended')}
        >
          Recommended ({recommendedJobs.length})
        </button>
        <button 
          className={`tab-pill ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile & Resume
        </button>
      </div>

      {error && <div className="alert alert-danger py-2 fs-7 rounded shadow-sm mb-3">{error}</div>}
      {success && <div className="alert alert-success py-2 fs-7 rounded shadow-sm mb-3">{success}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : activeTab === 'applications' ? (
        /* Applications Tab */
        <div>
          {applications.length === 0 ? (
            <div className="card-main text-center p-5 text-muted bg-white">
              You haven't applied to any jobs yet. Go to Browse Jobs to start.
            </div>
          ) : (
            <div className="row g-4">
              {applications.map(app => (
                <div key={app.id} className="col-12">
                  <div className="card-main p-4 bg-white shadow-sm card-hover-border">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <h5 className="mb-1 fw-bold text-dark">{app.job.title}</h5>
                        <p className="text-primary mb-2 fw-medium">
                          <Link to={`/companies/${app.job.company.id}`} className="text-primary text-decoration-none">{app.job.company.name}</Link> — <span className="text-muted fs-7">{app.job.location}</span>
                        </p>
                        <p className="text-muted fs-8 mb-0">Applied at: {new Date(app.appliedAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="text-md-end">
                        <span className={`badge-status ${getStatusBadgeClass(app.status)} mb-2 d-inline-block`}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <div className="text-muted fs-8">ATS Match: <strong className="text-dark">{app.score}%</strong></div>
                      </div>
                    </div>

                    {/* Show interview info if scheduled */}
                    {app.status === 'INTERVIEW_SCHEDULED' && (
                      <div className="mt-3 p-3 bg-light rounded border border-primary-subtle">
                        <h6 className="text-primary flex align-items-center gap-2 mb-2 fw-bold">
                          <Calendar size={16} /> Interview Scheduled
                        </h6>
                        <p className="fs-7 mb-1 text-dark">Recruiter scheduled an interview for you.</p>
                        <p className="fs-7 text-muted mb-0">
                          Attending link: <a href="https://meet.google.com" target="_blank" rel="noreferrer" className="text-primary fw-medium">Google Meet Video Link</a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'saved' ? (
        /* Saved Jobs Tab */
        <div>
          {savedJobs.length === 0 ? (
            <div className="card-main text-center p-5 text-muted bg-white">
              No bookmarked jobs found. Click the heart icon on job cards to bookmark them.
            </div>
          ) : (
            <div className="row g-4">
              {savedJobs.map(job => (
                <div key={job.id} className="col-md-6">
                  <div className="card-main p-4 bg-white shadow-sm d-flex flex-column justify-content-between position-relative card-hover-border">
                    <button 
                      onClick={() => handleUnsaveJob(job.id)} 
                      className="save-job-btn position-absolute"
                      style={{ top: '16px', right: '16px' }}
                    >
                      <Heart size={18} className="text-danger fill-current" />
                    </button>
                    <div>
                      <h5 className="text-dark fw-bold mb-1">{job.title}</h5>
                      <span className="text-primary fw-medium fs-7">{job.company.name}</span>
                      <p className="text-muted fs-8 mt-2"><MapPin size={12} /> {job.location} • {job.jobType.replace('_', ' ')}</p>
                    </div>
                    <div className="d-flex justify-content-end border-top pt-3 mt-3">
                      <Link to="/" className="btn btn-sm btn-outline-primary-custom">View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'recommended' ? (
        /* Recommended Jobs Tab */
        <div>
          {recommendedJobs.length === 0 ? (
            <div className="card-main text-center p-5 text-muted bg-white">
              Add more programming skills to your profile to receive matched job recommendations.
            </div>
          ) : (
            <div className="row g-4">
              {recommendedJobs.map(job => (
                <div key={job.id} className="col-md-6">
                  <div className="card-main p-4 bg-white shadow-sm d-flex flex-column justify-content-between card-hover-border">
                    <div>
                      <h5 className="text-dark fw-bold mb-1">{job.title}</h5>
                      <span className="text-primary fw-medium fs-7">{job.company.name}</span>
                      <p className="text-muted fs-8 mt-2"><MapPin size={12} /> {job.location} • {job.jobType.replace('_', ' ')}</p>
                      {job.requirements && (
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {job.requirements.split(',').map((req, idx) => (
                            <span key={idx} className="badge-skill fs-9">{req.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-end border-top pt-3 mt-3">
                      <Link to="/" className="btn btn-sm btn-grad-primary">Apply Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Profile & Resume Tab */
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card-main p-4 bg-white shadow-sm">
              <h4 className="text-dark fw-bold mb-3">Upload PDF Resume</h4>
              <p className="text-muted fs-7 mb-4">
                Upload your resume. Our system automatically parses the text, calculates an industry rating, and performs ATS keyword-checks when you apply.
              </p>
              
              <form onSubmit={handleFileUpload}>
                <div className="mb-3">
                  <input 
                    type="file" 
                    className="form-control input-main w-100" 
                    id="resumeFileInput"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-grad-primary w-100 py-2" disabled={uploading}>
                  {uploading ? 'Parsing File...' : 'Upload & Analyze Resume'}
                </button>
              </form>

              {latestResume && (
                <div className="mt-4 border-top pt-4">
                  <h5 className="text-dark fw-bold mb-3 d-flex align-items-center gap-2">
                    <FileText className="text-primary" /> Active Resume File
                  </h5>
                  <div className="bg-light p-3 rounded border mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold text-dark">{latestResume.fileName}</span>
                      <span className="badge bg-success fs-8">Active</span>
                    </div>
                    <span className="text-muted fs-8">Uploaded on {new Date(latestResume.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {latestResume.aiAnalysis && (
                    <div className="mt-3">
                      <h6 className="text-primary fw-bold flex align-items-center gap-2">
                        <Sparkles size={14} /> AI Score Analysis Summary
                      </h6>
                      <div className="fs-7 text-muted mt-1 bg-light p-3 rounded">
                        {(() => {
                          try {
                            const details = JSON.parse(latestResume.aiAnalysis)
                            return (
                              <div>
                                <p className="mb-1"><strong>Strengths:</strong> {details.strengths?.join(', ')}</p>
                                <p className="mb-1"><strong>Suggested Gaps:</strong> {details.gaps?.join(', ')}</p>
                                <p className="mb-0"><strong>Advice:</strong> {details.career_recommendations?.join(' ')}</p>
                              </div>
                            )
                          } catch (e) {
                            return <p>{latestResume.aiAnalysis}</p>
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card-main p-4 bg-white shadow-sm">
              <h4 className="text-dark fw-bold mb-3">Manage Profile Skills</h4>
              <p className="text-muted fs-7 mb-4">
                Add standard programming languages and utilities. Recruiters search profiles by these tags, and our AI maps skill-gaps based on them.
              </p>

              <form onSubmit={handleAddSkill} className="d-flex gap-2 mb-4">
                <input 
                  type="text" 
                  className="form-control input-main flex-grow-1" 
                  placeholder="e.g. Java, Python, React..." 
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-grad-primary d-flex align-items-center gap-1">
                  <Plus size={16} /> Add
                </button>
              </form>

              <h5 className="text-dark fw-bold mb-3">Your Skills ({skills.length})</h5>
              {skills.length === 0 ? (
                <div className="text-muted fs-7">No skills added yet. Type a skill above to begin.</div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span key={s.id} className="badge-skill py-2 px-3 fs-7 d-flex align-items-center gap-2">
                      {s.name}
                      <Trash2 
                        size={14} 
                        className="text-danger cursor-pointer hover:opacity-80" 
                        onClick={() => handleRemoveSkill(s.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
