import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../App'
import { 
  MapPin, Phone, Mail, Linkedin, Github, Globe, Plus, Trash2, Edit2, 
  Briefcase, GraduationCap, FileText, CheckCircle, Eye, EyeOff, Check, X 
} from 'lucide-react'

export default function UserProfile() {
  const { user: currentUser, setUser } = useContext(AuthContext)
  const { email } = useParams()
  
  const isOwnProfile = !email || (currentUser && currentUser.email === email)
  const targetEmail = isOwnProfile ? (currentUser ? currentUser.email : null) : email

  const [profile, setProfile] = useState(null)
  const [experiences, setExperiences] = useState([])
  const [educations, setEducations] = useState([])
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)
  
  // Forms
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    headline: '',
    bio: '',
    location: '',
    experienceYears: 0,
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    profileVisibility: 'PUBLIC',
    profilePhotoUrl: ''
  })
  
  const [expForm, setExpForm] = useState({
    id: null,
    companyName: '',
    title: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  })
  
  const [eduForm, setEduForm] = useState({
    id: null,
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: 2020,
    endYear: 2024,
    grade: ''
  })

  useEffect(() => {
    if (targetEmail) {
      loadProfileData()
    }
  }, [targetEmail])

  const loadProfileData = async () => {
    setLoading(true)
    setError('')
    try {
      const endpoint = isOwnProfile 
        ? '/api/users/profile/details' 
        : `/api/users/profile/public/${targetEmail}`
      
      const res = await axios.get(endpoint)
      setProfile(res.data.user)
      setExperiences(res.data.experiences || [])
      setEducations(res.data.educations || [])
      
      // Load resumes only if it's own profile or recruiter viewing
      if (isOwnProfile) {
        const resResumes = await axios.get('/api/users/profile/resumes')
        setResumes(resResumes.data || [])
      }

      // Prepopulate edit form
      if (res.data.user) {
        setProfileForm({
          fullName: res.data.user.fullName || '',
          phone: res.data.user.phone || '',
          headline: res.data.user.headline || '',
          bio: res.data.user.bio || '',
          location: res.data.user.location || '',
          experienceYears: res.data.user.experienceYears || 0,
          linkedinUrl: res.data.user.linkedinUrl || '',
          githubUrl: res.data.user.githubUrl || '',
          portfolioUrl: res.data.user.portfolioUrl || '',
          profileVisibility: res.data.user.profileVisibility || 'PUBLIC',
          profilePhotoUrl: res.data.user.profilePhotoUrl || ''
        })
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null) || 'Failed to load profile details.')
    } finally {
      setLoading(false)
    }
  }

  // Edit Profile Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.put('/api/users/profile', profileForm)
      setProfile(res.data)
      setShowEditProfileModal(false)
      
      // Update global context name & photo
      if (isOwnProfile && currentUser) {
        const updatedUser = { ...currentUser, fullName: res.data.fullName, profilePhotoUrl: res.data.profilePhotoUrl }
        setUser(updatedUser)
        localStorage.setItem('hirehub_user', JSON.stringify(updatedUser))
      }
    } catch (err) {
      alert(err.response?.data || 'Failed to update profile.')
    }
  }

  // Handle Profile Photo Upload (Convert to Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileForm({ ...profileForm, profilePhotoUrl: reader.result })
    }
    reader.readAsDataURL(file)
  }

  // Add/Edit Experience Submit
  const handleExperienceSubmit = async (e) => {
    e.preventDefault()
    try {
      if (expForm.id) {
        // Edit
        await axios.put(`/api/users/profile/experience/${expForm.id}`, expForm)
      } else {
        // Add
        await axios.post('/api/users/profile/experience', expForm)
      }
      setShowExperienceModal(false)
      loadProfileData()
    } catch (err) {
      alert(err.response?.data || 'Failed to save experience.')
    }
  }

  // Delete Experience
  const handleDeleteExperience = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience record?')) {
      try {
        await axios.delete(`/api/users/profile/experience/${id}`)
        loadProfileData()
      } catch (err) {
        alert('Failed to delete experience.')
      }
    }
  }

  // Add/Edit Education Submit
  const handleEducationSubmit = async (e) => {
    e.preventDefault()
    try {
      if (eduForm.id) {
        // Edit
        await axios.put(`/api/users/profile/education/${eduForm.id}`, eduForm)
      } else {
        // Add
        await axios.post('/api/users/profile/education', eduForm)
      }
      setShowEducationModal(false)
      loadProfileData()
    } catch (err) {
      alert(err.response?.data || 'Failed to save education.')
    }
  }

  // Delete Education
  const handleDeleteEducation = async (id) => {
    if (window.confirm('Are you sure you want to delete this education record?')) {
      try {
        await axios.delete(`/api/users/profile/education/${id}`)
        loadProfileData()
      } catch (err) {
        alert('Failed to delete education.')
      }
    }
  }

  // Skills
  const [newSkill, setNewSkill] = useState('')
  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    try {
      await axios.post(`/api/users/profile/skills?skillName=${encodeURIComponent(newSkill)}`)
      setNewSkill('')
      loadProfileData()
    } catch (err) {
      alert('Failed to add skill.')
    }
  }

  const handleRemoveSkill = async (skillId) => {
    try {
      await axios.delete(`/api/users/profile/skills/${skillId}`)
      loadProfileData()
    } catch (err) {
      alert('Failed to remove skill.')
    }
  }

  // Resume upload helper
  const [uploadingResume, setUploadingResume] = useState(false)
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    
    setUploadingResume(true)
    try {
      await axios.post('/api/users/profile/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      loadProfileData()
    } catch (err) {
      alert('Failed to upload resume.')
    } finally {
      setUploadingResume(false)
    }
  }

  // Calculate completeness
  const calculateCompleteness = () => {
    if (!profile) return 0
    let points = 0
    if (profile.profilePhotoUrl) points += 15
    if (profile.headline) points += 15
    if (profile.bio) points += 15
    if (profile.location) points += 15
    if (experiences.length > 0) points += 15
    if (educations.length > 0) points += 15
    if (profile.skills && profile.skills.size > 0) points += 10
    return points
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger shadow-sm text-center py-4">
        <h4>Access Error</h4>
        <p className="mb-0">{error}</p>
        <Link className="btn btn-outline-primary-custom mt-3" to="/">Return to Job Search</Link>
      </div>
    )
  }

  return (
    <div className="row animate-fade-in">
      {/* Profile Header */}
      <div className="col-12">
        <div className="profile-header">
          <div className="profile-cover">
            <div className="profile-avatar-container">
              <img 
                src={profile?.profilePhotoUrl || '/images/avatars/default-avatar.png'} 
                alt="Avatar" 
                className="profile-avatar"
                onError={(e) => { e.target.src = '/images/avatars/default-avatar.png' }}
              />
            </div>
          </div>
          
          <div className="profile-header-info">
            <div className="d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <h2 className="mb-1" style={{ fontWeight: 700 }}>{profile?.fullName}</h2>
                <p className="text-primary fw-medium mb-2" style={{ fontSize: '1.1rem' }}>{profile?.headline}</p>
                
                <div className="d-flex flex-wrap gap-3 text-muted fs-7">
                  {profile?.location && (
                    <span className="d-flex align-items-center gap-1">
                      <MapPin size={16} /> {profile.location}
                    </span>
                  )}
                  <span className="d-flex align-items-center gap-1">
                    <Mail size={16} /> {profile?.email}
                  </span>
                  {profile?.phone && (
                    <span className="d-flex align-items-center gap-1">
                      <Phone size={16} /> {profile.phone}
                    </span>
                  )}
                </div>
              </div>
              
              {isOwnProfile && (
                <button 
                  className="btn btn-grad-primary d-flex align-items-center gap-1 mt-3 mt-md-0" 
                  onClick={() => setShowEditProfileModal(true)}
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>
            
            {/* Social media connections */}
            {(profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioUrl) && (
              <div className="d-flex gap-2 mt-3 pt-3 border-top border-light">
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Linkedin size={18} />
                  </a>
                )}
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Github size={18} />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Globe size={18} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details (Left side: Main Content, Right side: Quick Info / Skills) */}
      <div className="col-lg-8">
        
        {/* Completeness Bar */}
        {isOwnProfile && (
          <div className="card-main p-4 mb-4">
            <h5 className="mb-2">Profile Completeness</h5>
            <div className="d-flex align-items-center gap-3">
              <div className="progress w-100" style={{ height: '10px', borderRadius: '10px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  role="progressbar" 
                  style={{ width: `${calculateCompleteness()}%`, borderRadius: '10px', background: 'var(--gradient-primary)' }}
                  aria-valuenow={calculateCompleteness()} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
              <span className="fw-bold">{calculateCompleteness()}%</span>
            </div>
            {calculateCompleteness() < 100 && (
              <p className="text-muted fs-7 mb-0 mt-2">
                Tip: Add experience, education, skills, and a profile photo to reach 100% and stand out to recruiters!
              </p>
            )}
          </div>
        )}

        {/* About / Bio */}
        <div className="card-main p-4 mb-4">
          <h4 className="mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
            <Briefcase className="text-primary" size={22} /> About Me
          </h4>
          {profile?.bio ? (
            <p className="mb-0 text-body" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>{profile.bio}</p>
          ) : (
            <p className="text-muted mb-0 italic">No description provided yet.</p>
          )}
        </div>

        {/* Work Experience */}
        <div className="card-main p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h4 className="m-0 d-flex align-items-center gap-2">
              <Briefcase className="text-primary" size={22} /> Experience
            </h4>
            {isOwnProfile && (
              <button 
                className="btn btn-sm btn-outline-primary-custom d-flex align-items-center gap-1"
                onClick={() => {
                  setExpForm({
                    id: null,
                    companyName: '',
                    title: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                    description: ''
                  })
                  setShowExperienceModal(true)
                }}
              >
                <Plus size={16} /> Add Exp
              </button>
            )}
          </div>

          {experiences.length === 0 ? (
            <p className="text-muted mb-0 italic">No experience records added.</p>
          ) : (
            <div className="experience-timeline">
              {experiences.map(exp => (
                <div key={exp.id} className="experience-item">
                  <div className="experience-dot"></div>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-1 text-primary fw-bold">{exp.title}</h5>
                      <h6 className="mb-2 text-dark">{exp.companyName}</h6>
                      <p className="text-muted fs-7 mb-2">
                        {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
                      </p>
                      {exp.description && (
                        <p className="fs-7 text-body" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                      )}
                    </div>

                    {isOwnProfile && (
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-link p-1 text-muted hover-text-primary"
                          onClick={() => {
                            setExpForm({
                              id: exp.id,
                              companyName: exp.companyName,
                              title: exp.title,
                              startDate: exp.startDate || '',
                              endDate: exp.endDate || '',
                              isCurrent: exp.isCurrent || false,
                              description: exp.description || ''
                            })
                            setShowExperienceModal(true)
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-link p-1 text-danger"
                          onClick={() => handleDeleteExperience(exp.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="card-main p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h4 className="m-0 d-flex align-items-center gap-2">
              <GraduationCap className="text-primary" size={22} /> Education
            </h4>
            {isOwnProfile && (
              <button 
                className="btn btn-sm btn-outline-primary-custom d-flex align-items-center gap-1"
                onClick={() => {
                  setEduForm({
                    id: null,
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    startYear: 2020,
                    endYear: 2024,
                    grade: ''
                  })
                  setShowEducationModal(true)
                }}
              >
                <Plus size={16} /> Add Edu
              </button>
            )}
          </div>

          {educations.length === 0 ? (
            <p className="text-muted mb-0 italic">No education records added.</p>
          ) : (
            <div className="row g-3">
              {educations.map(edu => (
                <div key={edu.id} className="col-12">
                  <div className="card shadow-sm border-light p-3 education-card h-100">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="mb-1 fw-bold">{edu.institution}</h5>
                        <p className="mb-1 text-primary fw-medium">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-muted fs-7 mb-1">Class of {edu.startYear} - {edu.endYear}</p>
                        {edu.grade && <span className="badge bg-light text-dark fs-7">Grade: {edu.grade}</span>}
                      </div>

                      {isOwnProfile && (
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-link p-1 text-muted hover-text-primary"
                            onClick={() => {
                              setEduForm({
                                id: edu.id,
                                institution: edu.institution,
                                degree: edu.degree || '',
                                fieldOfStudy: edu.fieldOfStudy || '',
                                startYear: edu.startYear || 2020,
                                endYear: edu.endYear || 2024,
                                grade: edu.grade || ''
                              })
                              setShowEducationModal(true)
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-sm btn-link p-1 text-danger"
                            onClick={() => handleDeleteEducation(edu.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Skills Profile & Resume */}
      <div className="col-lg-4">
        
        {/* Profile Visibility */}
        {isOwnProfile && (
          <div className="card-main p-4 mb-4">
            <h5 className="mb-3">Visibility Settings</h5>
            <div className="d-flex justify-content-between align-items-center">
              <span className="fs-7 text-muted">Allow recruiters to find you:</span>
              <div className="d-flex align-items-center gap-1 border rounded-pill px-3 py-1">
                {profile?.profileVisibility === 'PUBLIC' ? (
                  <>
                    <Eye size={16} className="text-success" />
                    <span className="fw-semibold text-success fs-7">Public</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={16} className="text-secondary" />
                    <span className="fw-semibold text-secondary fs-7">Private</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Skills Tag Cloud */}
        <div className="card-main p-4 mb-4">
          <h5 className="mb-3 d-flex align-items-center gap-2">
            Skills Profile
          </h5>
          
          {isOwnProfile && (
            <form onSubmit={handleAddSkill} className="mb-3 d-flex gap-2">
              <input 
                type="text" 
                className="form-control form-control-sm input-main" 
                placeholder="e.g. Docker, Python" 
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
              />
              <button type="submit" className="btn btn-sm btn-grad-primary">Add</button>
            </form>
          )}

          {(!profile?.skills || profile.skills.length === 0) ? (
            <p className="text-muted mb-0 italic">No skills listed.</p>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill.id} className="badge-skill">
                  {skill.name}
                  {isOwnProfile && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="btn-close ms-1" 
                      style={{ width: '0.4em', height: '0.4em' }}
                      aria-label="Remove"
                    ></button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Resume Manager (Only for Candidate themselves) */}
        {isOwnProfile && (
          <div className="card-main p-4 mb-4">
            <h5 className="mb-3 d-flex align-items-center gap-2">
              <FileText className="text-primary" size={18} /> Active Resume
            </h5>
            
            <div className="mb-3">
              <label className="btn btn-outline-primary-custom w-100 d-flex align-items-center justify-content-center gap-2">
                <FileText size={18} />
                {uploadingResume ? 'Uploading...' : 'Upload New Resume'}
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  className="d-none" 
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                />
              </label>
            </div>

            {resumes.length === 0 ? (
              <p className="text-muted text-center fs-7 py-3 mb-0 border rounded border-dashed">
                No resume uploaded.
              </p>
            ) : (
              resumes.slice(0, 1).map(res => {
                let analysis = null;
                try {
                  analysis = res.aiAnalysis ? JSON.parse(res.aiAnalysis) : null;
                } catch (e) {
                  console.error("Failed to parse resume analysis JSON:", e);
                }
                return (
                  <div key={res.id} className="p-3 border rounded">
                    <p className="fw-semibold text-truncate mb-1" style={{ fontSize: '0.9rem' }}>
                      {res.fileName}
                    </p>
                    <p className="text-muted fs-7 mb-2">
                      AI Assessment: <strong className="text-success">{res.aiScore}/100</strong>
                    </p>
                    
                    {analysis && (
                      <div className="mt-2 pt-2 border-top">
                        <span className="fw-bold fs-7 d-block mb-1">Strengths:</span>
                        <ul className="ps-3 mb-2 text-muted fs-7">
                          {analysis.strengths?.slice(0, 2).map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                        
                        <span className="fw-bold fs-7 d-block mb-1">Learning Recommendations:</span>
                        <ul className="ps-3 mb-0 text-muted fs-7">
                          {analysis.career_recommendations?.slice(0, 2).map((r, idx) => <li key={idx}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Edit Profile Details */}
      {showEditProfileModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-light rounded-4 shadow-lg p-3" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Profile Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditProfileModal(false)}></button>
              </div>
              <form onSubmit={handleProfileSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fs-7">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        value={profileForm.fullName}
                        onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fs-7">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fs-7">Profile Picture</label>
                      <div className="d-flex align-items-center gap-3">
                        {profileForm.profilePhotoUrl && (
                          <img 
                            src={profileForm.profilePhotoUrl} 
                            alt="Preview" 
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          className="form-control input-main" 
                          onChange={handlePhotoUpload}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fs-7">Headline (e.g. Senior Java Dev)</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        value={profileForm.headline}
                        onChange={e => setProfileForm({ ...profileForm, headline: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fs-7">Location (City, State/Country)</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        value={profileForm.location}
                        onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fs-7">Years of Experience</label>
                      <input 
                        type="number" 
                        className="form-control input-main" 
                        value={profileForm.experienceYears}
                        onChange={e => setProfileForm({ ...profileForm, experienceYears: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fs-7">Profile Bio</label>
                      <textarea 
                        className="form-control input-main" 
                        rows="3" 
                        value={profileForm.bio}
                        onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fs-7">LinkedIn URL</label>
                      <input 
                        type="url" 
                        className="form-control input-main" 
                        value={profileForm.linkedinUrl}
                        onChange={e => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fs-7">GitHub URL</label>
                      <input 
                        type="url" 
                        className="form-control input-main" 
                        value={profileForm.githubUrl}
                        onChange={e => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fs-7">Portfolio URL</label>
                      <input 
                        type="url" 
                        className="form-control input-main" 
                        value={profileForm.portfolioUrl}
                        onChange={e => setProfileForm({ ...profileForm, portfolioUrl: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fs-7">Profile Visibility</label>
                      <select 
                        className="form-select input-main"
                        value={profileForm.profileVisibility}
                        onChange={e => setProfileForm({ ...profileForm, profileVisibility: e.target.value })}
                      >
                        <option value="PUBLIC">Public (Visible to Recruiters)</option>
                        <option value="PRIVATE">Private (Hidden)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-glass" onClick={() => setShowEditProfileModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-grad-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add/Edit Experience */}
      {showExperienceModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-light rounded-4 shadow-lg p-3" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{expForm.id ? 'Edit Experience' : 'Add Experience'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowExperienceModal(false)}></button>
              </div>
              <form onSubmit={handleExperienceSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fs-7">Job Title</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        value={expForm.title}
                        onChange={e => setExpForm({ ...expForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fs-7">Company Name</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        value={expForm.companyName}
                        onChange={e => setExpForm({ ...expForm, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fs-7">Start Date</label>
                      <input 
                        type="date" 
                        className="form-control input-main" 
                        value={expForm.startDate}
                        onChange={e => setExpForm({ ...expForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fs-7">End Date</label>
                      <input 
                        type="date" 
                        className="form-control input-main" 
                        value={expForm.endDate}
                        onChange={e => setExpForm({ ...expForm, endDate: e.target.value })}
                        disabled={expForm.isCurrent}
                        required={!expForm.isCurrent}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          id="isCurrentExp"
                          checked={expForm.isCurrent}
                          onChange={e => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                        />
                        <label className="form-check-label fs-7" htmlFor="isCurrentExp">I currently work here</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fs-7">Description</label>
                      <textarea 
                        className="form-control input-main" 
                        rows="3" 
                        value={expForm.description}
                        onChange={e => setExpForm({ ...expForm, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-glass" onClick={() => setShowExperienceModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-grad-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add/Edit Education */}
      {showEducationModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-light rounded-4 shadow-lg p-3" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{eduForm.id ? 'Edit Education' : 'Add Education'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEducationModal(false)}></button>
              </div>
              <form onSubmit={handleEducationSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fs-7">Institution</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        value={eduForm.institution}
                        onChange={e => setEduForm({ ...eduForm, institution: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fs-7">Degree (e.g. B.S., M.S.)</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        value={eduForm.degree}
                        onChange={e => setEduForm({ ...eduForm, degree: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fs-7">Field of Study</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        value={eduForm.fieldOfStudy}
                        onChange={e => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fs-7">Start Year</label>
                      <input 
                        type="number" 
                        className="form-control input-main" 
                        value={eduForm.startYear}
                        onChange={e => setEduForm({ ...eduForm, startYear: parseInt(e.target.value) || 2020 })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fs-7">End Year (Expected)</label>
                      <input 
                        type="number" 
                        className="form-control input-main" 
                        value={eduForm.endYear}
                        onChange={e => setEduForm({ ...eduForm, endYear: parseInt(e.target.value) || 2024 })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fs-7">Grade/GPA</label>
                      <input 
                        type="text" 
                        className="form-control input-main" 
                        placeholder="e.g. 3.8 GPA"
                        value={eduForm.grade}
                        onChange={e => setEduForm({ ...eduForm, grade: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-glass" onClick={() => setShowEducationModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-grad-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
