import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { 
  Search, MapPin, Briefcase, DollarSign, Sparkles, Filter, Heart, 
  ArrowRight, Users, TrendingUp, Award, Building2, Globe, Calendar, Star,
  Linkedin, Twitter, Github, Mail, Phone, Compass
} from 'lucide-react'
import { AuthContext } from '../App'
import { useNavigate, Link } from 'react-router-dom'

export default function LandingPage() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [jobs, setJobs] = useState([])
  const [companies, setCompanies] = useState([])
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  
  // Search parameters
  const [searchTitle, setSearchTitle] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchType, setSearchType] = useState('All')
  const [salaryFilter, setSalaryFilter] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchJobs()
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (user && user.role === 'ROLE_JOBSEEKER') {
      fetchSavedJobs()
    }
  }, [user])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/jobs')
      setJobs(res.data)
    } catch (err) {
      console.error("Failed to load jobs", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/companies')
      setCompanies(res.data || [])
    } catch (err) {
      console.error("Failed to load companies", err)
    }
  }

  const fetchSavedJobs = async () => {
    try {
      const res = await axios.get('/api/jobs/saved')
      setSavedJobIds(new Set(res.data.map(j => j.id)))
    } catch (err) {
      console.error("Failed to load saved jobs", err)
    }
  }

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.get('/api/jobs/search', {
        params: {
          title: selectedCategory || searchTitle,
          location: searchLocation,
          jobType: searchType === 'All' ? '' : searchType
        }
      })
      
      // Client side salary filter if selected
      let filtered = res.data
      if (salaryFilter) {
        filtered = res.data.filter(job => {
          if (!job.salaryRange) return false
          const salaryNum = parseInt(job.salaryRange.replace(/[^0-9]/g, ''))
          if (salaryFilter === 'low') return salaryNum < 800000
          if (salaryFilter === 'med') return salaryNum >= 800000 && salaryNum <= 1500000
          if (salaryFilter === 'high') return salaryNum > 1500000
          return true
        })
      }
      setJobs(filtered)
    } catch (err) {
      console.error("Search failed", err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Category click
  const handleCategorySelect = (categoryName) => {
    const term = categoryName.split(' ')[1] || categoryName // Get name without emoji
    setSelectedCategory(term)
    setSearchTitle(term)
    // Run search automatically
    setLoading(true)
    axios.get('/api/jobs/search', {
      params: {
        title: term,
        location: searchLocation,
        jobType: searchType === 'All' ? '' : searchType
      }
    }).then(res => {
      setJobs(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const toggleBookmark = async (e, jobId) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'ROLE_JOBSEEKER') return

    const isSaved = savedJobIds.has(jobId)
    try {
      if (isSaved) {
        await axios.delete(`/api/jobs/${jobId}/save`)
        const updated = new Set(savedJobIds)
        updated.delete(jobId)
        setSavedJobIds(updated)
      } else {
        await axios.post(`/api/jobs/${jobId}/save`)
        const updated = new Set(savedJobIds)
        updated.add(jobId)
        setSavedJobIds(updated)
      }
    } catch (err) {
      console.error("Failed to bookmark job", err)
    }
  }


  return (
    <div className="animate-fade-in">
      {/* Premium Hero Section */}
      <div className="hero-wrapper rounded-4 shadow-sm mb-5 overflow-hidden">
        <div className="container px-4">
          <div className="row align-items-center">
            <div className="col-lg-7 py-3">
              <div className="ai-badge mb-3">
                <Sparkles size={14} className="text-primary" />
                <span>AI-Powered Matching Engine v2.0</span>
              </div>
              <h1 className="display-4 fw-bold text-dark mb-3" style={{ lineHeight: '1.15', fontFamily: 'Outfit, sans-serif' }}>
                Find Your Next <span className="text-gradient">Dream Career</span> Today
              </h1>
              <p className="lead text-muted mb-4" style={{ fontSize: '1.1rem', maxWidth: '580px' }}>
                Discover vacancies with automated ATS scanners, gap assessments, and custom career paths designed to match your skills.
              </p>
              
              {/* Counter Row */}
              <div className="d-flex flex-wrap gap-4 mt-2">
                <div className="text-center bg-white p-3 rounded-3 shadow-sm border border-light" style={{ minWidth: '110px' }}>
                  <div className="counter-stat text-gradient">10k+</div>
                  <div className="text-muted fs-8 fw-semibold text-uppercase">Live Jobs</div>
                </div>
                <div className="text-center bg-white p-3 rounded-3 shadow-sm border border-light" style={{ minWidth: '110px' }}>
                  <div className="counter-stat text-gradient">5k+</div>
                  <div className="text-muted fs-8 fw-semibold text-uppercase">Companies</div>
                </div>
                <div className="text-center bg-white p-3 rounded-3 shadow-sm border border-light" style={{ minWidth: '110px' }}>
                  <div className="counter-stat text-gradient">95%</div>
                  <div className="text-muted fs-8 fw-semibold text-uppercase">Match Rate</div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-5 d-none d-lg-block text-center">
              <img 
                src="/images/hero-banner.png" 
                alt="Banner Graphic" 
                className="img-fluid rounded-4 shadow"
                style={{ maxHeight: '350px', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search Console */}
      <div className="card-main p-4 mb-5 shadow-sm">
        <h5 className="mb-3 text-dark fw-bold d-flex align-items-center gap-2">
          <Filter size={18} className="text-primary" /> Filter Job Postings
        </h5>
        <form onSubmit={handleSearch} className="row g-3">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-0 text-muted"><Search size={18} /></span>
              <input 
                type="text" 
                className="form-control input-main border-0 bg-light" 
                placeholder="Title, Skill, Keyword..." 
                value={searchTitle}
                onChange={(e) => {
                  setSearchTitle(e.target.value)
                  setSelectedCategory('')
                }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-0 text-muted"><MapPin size={18} /></span>
              <input 
                type="text" 
                className="form-control input-main border-0 bg-light" 
                placeholder="City, State, Remote..." 
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select input-main border-0 bg-light text-muted" 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="All">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select input-main border-0 bg-light text-muted"
              value={salaryFilter}
              onChange={(e) => setSalaryFilter(e.target.value)}
            >
              <option value="">Any Salary</option>
              <option value="low">Under ₹8,00,000</option>
              <option value="med">₹8,00,000 - ₹15,00,000</option>
              <option value="high">Above ₹15,00,000</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-grad-primary w-100">Search</button>
          </div>
        </form>
      </div>

      {/* Featured Companies Section */}
      <div className="mb-5 full-width-breakout bg-section py-5">
        <div className="container">
          <h3 className="mb-4 fw-bold text-dark d-flex align-items-center gap-2">
            <Building2 className="text-primary" /> Top Companies Hiring
          </h3>
          <div className="row g-4">
            {companies.map(comp => (
              <div key={comp.id} className="col-12 col-md-6 col-lg-3">
                <Link 
                  to={`/companies/${comp.id}`} 
                  className="text-decoration-none d-block h-100"
                >
                  <div className="card-main p-3 h-100 d-flex flex-column align-items-center text-center">
                    <img 
                      src={comp.coverPhotoUrl || '/images/companies/google-office.png'} 
                      alt="Cover" 
                      className="w-100 rounded mb-3"
                      style={{ height: '80px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/images/companies/google-office.png' }}
                    />
                    <div 
                      className="bg-white rounded-3 p-1 border shadow-sm"
                      style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-35px', zIndex: 2 }}
                    >
                      <img src={comp.logoUrl} alt="Logo" className="img-fluid" style={{ maxHeight: '100%' }} />
                    </div>
                    <h5 className="mb-1 text-dark fw-bold mt-2">{comp.name}</h5>
                    <span className="text-muted fs-8">{comp.industry}</span>
                    <div className="d-flex align-items-center gap-1 mt-2 text-warning fs-8">
                      <Star size={14} className="fill-current" /> {comp.glassdoorRating || '4.0'}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mb-5">
        <h3 className="mb-3 fw-bold text-dark">Explore Job Categories</h3>
        <div className="row g-3">
          <div className="col-6 col-md-3" onClick={() => handleCategorySelect('💻 Developer')}><div className="category-card"><div className="fs-2 mb-2">💻</div><h6 className="fw-bold mb-0 text-dark">IT & Coding</h6></div></div>
          <div className="col-6 col-md-3" onClick={() => handleCategorySelect('📊 Data')}><div className="category-card"><div className="fs-2 mb-2">📊</div><h6 className="fw-bold mb-0 text-dark">Data Science</h6></div></div>
          <div className="col-6 col-md-3" onClick={() => handleCategorySelect('🎨 React')}><div className="category-card"><div className="fs-2 mb-2">🎨</div><h6 className="fw-bold mb-0 text-dark">React & UI/UX</h6></div></div>
          <div className="col-6 col-md-3" onClick={() => handleCategorySelect('☁️ Cloud')}><div className="category-card"><div className="fs-2 mb-2">☁️</div><h6 className="fw-bold mb-0 text-dark">Cloud & AWS</h6></div></div>
        </div>
      </div>

      {/* Main Listings */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="m-0 fw-bold text-dark d-flex align-items-center gap-2">
              <Briefcase className="text-primary" /> Active Opportunities ({jobs.length})
            </h3>
            {(searchTitle || searchLocation || searchType !== 'All' || salaryFilter || selectedCategory) && (
              <button 
                onClick={() => {
                  setSearchTitle('')
                  setSearchLocation('')
                  setSearchType('All')
                  setSalaryFilter('')
                  setSelectedCategory('')
                  fetchJobs()
                }} 
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="card-main text-center p-5 text-muted">
              No jobs matching your filters found. Try clear search to reload.
            </div>
          ) : (
            <div className="row g-4">
              {jobs.map(job => (
                <div key={job.id} className="col-md-6 col-lg-6">
                  <div className="card-main p-4 h-100 d-flex flex-column justify-content-between position-relative card-hover-border">
                    {/* Bookmark Heart */}
                    {user?.role === 'ROLE_JOBSEEKER' && (
                      <button 
                        onClick={(e) => toggleBookmark(e, job.id)} 
                        className="save-job-btn position-absolute"
                        style={{ top: '16px', right: '16px' }}
                      >
                        <Heart 
                          size={18} 
                          className={savedJobIds.has(job.id) ? "text-danger fill-current" : "text-muted"} 
                        />
                      </button>
                    )}
                    
                    <div>
                      <div className="d-flex gap-3 align-items-start mb-3">
                        <div 
                          className="bg-white rounded-3 p-1 border shadow-sm flex-shrink-0"
                          style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <img src={job.company.logoUrl} alt="Logo" className="img-fluid" style={{ maxHeight: '100%' }} />
                        </div>
                        <div>
                          <h5 className="text-dark fw-bold mb-0">{job.title}</h5>
                          <Link to={`/companies/${job.company.id}`} className="text-primary fw-semibold fs-7 text-decoration-none">
                            {job.company.name}
                          </Link>
                        </div>
                      </div>
                      
                      <p className="text-body fs-7 mb-3 line-clamp-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                        {job.description}
                      </p>

                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {job.requirements && job.requirements.split(',').map((req, idx) => (
                          <span key={idx} className="badge-skill">
                            {req.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top border-light mt-3">
                      <div className="text-muted fs-8 d-flex align-items-center gap-1">
                        <MapPin size={14} /> {job.location}
                        <span className="mx-2">•</span>
                        <Briefcase size={14} /> {job.jobType.replace('_', ' ')}
                      </div>
                      <button className="btn btn-sm btn-outline-primary-custom px-3" onClick={() => navigate(`/jobs/${job.id}`)}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Dark Footer Section */}
      <footer className="footer-main py-5 mt-5 rounded-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="mb-3 d-flex align-items-center gap-2">
                <Briefcase className="text-primary" size={24} /> HireHub
              </h5>
              <p className="fs-8">
                An advanced AI-powered career portal matching developers and innovators with the worlds top tech employers. Track applications, scan resumes, and bridge skill gaps.
              </p>
              <div className="d-flex gap-2 mt-3">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Linkedin size={16} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Twitter size={16} /></a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Github size={16} /></a>
              </div>
            </div>
            
            <div className="col-md-2 offset-md-1">
              <h5 className="mb-3">Quick Links</h5>
              <ul className="list-unstyled fs-8">
                <li className="mb-2"><Link to="/">Browse Jobs</Link></li>
                <li className="mb-2"><Link to="/dashboard">Dashboard</Link></li>
                <li className="mb-2"><Link to="/ai-hub">AI Career Hub</Link></li>
              </ul>
            </div>
            
            <div className="col-md-2">
              <h5 className="mb-3">For Candidates</h5>
              <ul className="list-unstyled fs-8">
                <li className="mb-2"><Link to="/profile">My Profile</Link></li>
                <li className="mb-2"><Link to="/seeker-dashboard">ATS Tracker</Link></li>
                <li className="mb-2"><Link to="/ai-hub">Skill Gap Audit</Link></li>
              </ul>
            </div>
            
            <div className="col-md-3">
              <h5 className="mb-3">Contact Support</h5>
              <ul className="list-unstyled fs-8 text-muted">
                <li className="mb-2 d-flex align-items-center gap-2"><Mail size={14} /> support@hirehub.com</li>
                <li className="mb-2 d-flex align-items-center gap-2"><Phone size={14} /> +1 (555) 019-2834</li>
                <li className="d-flex align-items-center gap-2"><MapPin size={14} /> Silicon Valley, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-top border-secondary pt-3 mt-4 text-center fs-9 text-muted">
            &copy; {new Date().getFullYear()} HireHub. All rights reserved. Made for portfolio presentation.
          </div>
        </div>
      </footer>
    </div>
  )
}
