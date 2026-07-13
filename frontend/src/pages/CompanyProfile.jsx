import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { 
  Building2, MapPin, Globe, Users, Calendar, Star, DollarSign, 
  Briefcase, CheckCircle, ArrowRight, Heart
} from 'lucide-react'

export default function CompanyProfile() {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCompanyData()
  }, [id])

  const loadCompanyData = async () => {
    setLoading(true)
    setError('')
    try {
      // Get company info
      const companyRes = await axios.get(`/api/companies/${id}`)
      setCompany(companyRes.data)
      
      // Get company open jobs
      const jobsRes = await axios.get(`/api/companies/${id}/jobs`)
      setJobs(jobsRes.data || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load company profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Parse benefits list JSON or split string
  const getBenefitsList = () => {
    if (!company || !company.benefits) return []
    try {
      return JSON.parse(company.benefits)
    } catch (e) {
      return company.benefits.split(',').map(b => b.trim())
    }
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
      {/* Cover and Header */}
      <div className="col-12">
        <div className="profile-header mb-4">
          <img 
            src={company?.coverPhotoUrl || '/images/companies/google-office.png'} 
            alt="Cover" 
            className="w-100"
            style={{ height: '220px', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/images/companies/google-office.png' }}
          />
          <div className="p-4" style={{ marginTop: '-40px', position: 'relative', zIndex: '2' }}>
            <div className="d-flex align-items-end gap-3 flex-wrap">
              <div 
                className="bg-white rounded-3 p-2 shadow-sm border"
                style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <img 
                  src={company?.logoUrl || '/images/companies/google-office.png'} 
                  alt="Logo" 
                  className="img-fluid"
                  style={{ maxHeight: '100%', maxWidth: '100%' }}
                  onError={(e) => { e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="9" height="7" x="9" y="9" rx="1"/></svg>' }}
                />
              </div>
              <div className="pb-1">
                <h2 className="mb-1 fw-bold text-dark">{company?.name}</h2>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 fs-7">
                  {company?.industry}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Left: About, Perks, Jobs. Right: Stats, Tech Stack, Photos */}
      <div className="col-lg-8">
        {/* About Company */}
        <div className="card-main p-4 mb-4">
          <h4 className="mb-3 border-bottom pb-2">About {company?.name}</h4>
          <p className="text-body mb-0" style={{ lineHeight: '1.6' }}>{company?.description}</p>
        </div>

        {/* Work Culture */}
        {company?.cultureDescription && (
          <div className="card-main p-4 mb-4">
            <h4 className="mb-3 border-bottom pb-2">Work Culture</h4>
            <p className="text-body mb-0" style={{ lineHeight: '1.6' }}>{company.cultureDescription}</p>
          </div>
        )}

        {/* Benefits & Perks */}
        {getBenefitsList().length > 0 && (
          <div className="card-main p-4 mb-4">
            <h4 className="mb-3 border-bottom pb-2">Benefits & Perks</h4>
            <div className="row g-3">
              {getBenefitsList().map((perk, idx) => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="card shadow-sm border-light p-3 h-100 bg-light d-flex flex-row align-items-center gap-2">
                    <CheckCircle className="text-success flex-shrink-0" size={18} />
                    <span className="fw-semibold text-dark fs-7">{perk}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Job Listings */}
        <div className="card-main p-4 mb-4">
          <h4 className="mb-3 border-bottom pb-2">Open Openings ({jobs.length})</h4>
          {jobs.length === 0 ? (
            <p className="text-muted mb-0 italic">No active job openings currently.</p>
          ) : (
            <div className="row g-3">
              {jobs.map(job => (
                <div key={job.id} className="col-12">
                  <div className="card shadow-sm border-light p-3 h-100 card-hover-border">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="mb-1 fw-bold">{job.title}</h5>
                        <div className="d-flex flex-wrap gap-3 text-muted fs-7 mb-2">
                          <span className="d-flex align-items-center gap-1"><MapPin size={14} /> {job.location}</span>
                          <span className="badge bg-light text-dark">{job.jobType}</span>
                          {job.salaryRange && <span className="d-flex align-items-center gap-1"><DollarSign size={14} /> {job.salaryRange}</span>}
                        </div>
                        {job.requirements && (
                          <div className="d-flex flex-wrap gap-1">
                            {job.requirements.split(',').map((req, idx) => (
                              <span key={idx} className="badge bg-secondary-subtle text-secondary fs-8">{req}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Link className="btn btn-sm btn-outline-primary-custom d-flex align-items-center gap-1" to="/">
                        View Job <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Corporate Stats, Tech Stack, Gallery */}
      <div className="col-lg-4">
        {/* Company Quick Facts */}
        <div className="card-main p-4 mb-4">
          <h5 className="mb-3">Company Facts</h5>
          <ul className="list-unstyled mb-0">
            <li className="d-flex justify-content-between mb-2 pb-2 border-bottom border-light">
              <span className="text-muted fs-7 d-flex align-items-center gap-1"><Users size={16} /> Employees:</span>
              <strong className="text-dark fs-7">{company?.size || 'Unknown'}</strong>
            </li>
            <li className="d-flex justify-content-between mb-2 pb-2 border-bottom border-light">
              <span className="text-muted fs-7 d-flex align-items-center gap-1"><Calendar size={16} /> Founded:</span>
              <strong className="text-dark fs-7">{company?.foundedYear || 'N/A'}</strong>
            </li>
            <li className="d-flex justify-content-between mb-2 pb-2 border-bottom border-light">
              <span className="text-muted fs-7 d-flex align-items-center gap-1"><MapPin size={16} /> Headquarters:</span>
              <strong className="text-dark fs-7 text-truncate" style={{ maxWidth: '180px' }}>{company?.headquarters || company?.location}</strong>
            </li>
            <li className="d-flex justify-content-between pb-2">
              <span className="text-muted fs-7 d-flex align-items-center gap-1"><Star size={16} className="text-warning" /> Glassdoor:</span>
              <strong className="text-dark fs-7 d-flex align-items-center gap-1">
                {company?.glassdoorRating || '0.0'} <Star size={14} className="text-warning fill-current" />
              </strong>
            </li>
          </ul>
          {company?.website && (
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline-primary-custom w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
            >
              <Globe size={18} /> Visit Company Website
            </a>
          )}
        </div>

        {/* Tech Stack */}
        {company?.techStack && (
          <div className="card-main p-4 mb-4">
            <h5 className="mb-3">Tech Stack</h5>
            <div className="d-flex flex-wrap gap-2">
              {company.techStack.split(',').map((tech, idx) => (
                <span key={idx} className="badge-skill">{tech.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {/* Photo Gallery Grid (Simulated Office Images) */}
        <div className="card-main p-4 mb-4">
          <h5 className="mb-3">Office Locations</h5>
          <div className="photo-gallery-grid">
            <img 
              src={company?.coverPhotoUrl || '/images/companies/google-office.png'} 
              className="photo-gallery-img" 
              alt="Office 1"
              onError={(e) => { e.target.src = '/images/companies/google-office.png' }}
            />
            <img 
              src="/images/companies/microsoft-office.png" 
              className="photo-gallery-img" 
              alt="Office 2"
              onError={(e) => { e.target.src = '/images/companies/google-office.png' }}
            />
            <img 
              src="/images/companies/amazon-office.png" 
              className="photo-gallery-img" 
              alt="Office 3"
              onError={(e) => { e.target.src = '/images/companies/google-office.png' }}
            />
            <img 
              src="/images/companies/meta-office.png" 
              className="photo-gallery-img" 
              alt="Office 4"
              onError={(e) => { e.target.src = '/images/companies/google-office.png' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
