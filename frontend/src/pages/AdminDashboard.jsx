import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { 
  Users, Building2, Briefcase, FileText, CheckCircle, XCircle, 
  Trash2, ShieldAlert, Activity, BarChart2, User, Star, Globe, MapPin
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users') // users, companies, activity, trends
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [analytics, setAnalytics] = useState({ users: 0, companies: 0, jobs: 0, applications: 0 })
  const [chartData, setChartData] = useState(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchAdminData()
    fetchCompanies()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    setError('')
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/analytics')
      ])
      
      setUsers(usersRes.data)
      setAnalytics({
        users: analyticsRes.data.totalUsers,
        companies: analyticsRes.data.totalCompanies,
        jobs: analyticsRes.data.totalJobs,
        applications: analyticsRes.data.totalApplications
      })

      // Setup chart data
      const trends = analyticsRes.data.hiringTrends || []
      setChartData({
        labels: trends.map(t => t.month || 'Month'),
        datasets: [
          {
            label: 'Jobs Posted',
            data: trends.map(t => t.jobsCount || 0),
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            tension: 0.3
          },
          {
            label: 'Applications Submitted',
            data: trends.map(t => t.applicationsCount || 0),
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            tension: 0.3
          }
        ]
      })
    } catch (err) {
      console.error(err)
      setError('Failed to fetch admin statistics. Ensure backend is active.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/companies')
      setCompanies(res.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleBlock = async (userId) => {
    try {
      const res = await axios.put(`/api/admin/users/${userId}/toggle-block`)
      setSuccess(`Account status updated for user ID: ${userId}`)
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, status: res.data.status } : u))
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle account block.')
      setTimeout(() => setError(''), 2000)
    }
  }

  const getRoleBadgeClass = (roleName) => {
    switch (roleName) {
      case 'ROLE_ADMIN': return 'bg-danger text-white'
      case 'ROLE_RECRUITER': return 'bg-info text-dark'
      default: return 'bg-secondary text-white'
    }
  }

  return (
    <div className="animate-fade-in text-dark">
      {/* Overview stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-md-3">
          <div className="card-main p-4 bg-white shadow-sm stat-card-indigo">
            <h6 className="text-muted mb-1 fs-7 fw-semibold text-uppercase">Total Accounts</h6>
            <h2 className="display-6 fw-bold text-gradient">{analytics.users}</h2>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card-main p-4 bg-white shadow-sm stat-card-purple">
            <h6 className="text-muted mb-1 fs-7 fw-semibold text-uppercase">Companies</h6>
            <h2 className="display-6 fw-bold text-gradient">{analytics.companies || companies.length}</h2>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card-main p-4 bg-white shadow-sm stat-card-teal">
            <h6 className="text-muted mb-1 fs-7 fw-semibold text-uppercase">Live Jobs</h6>
            <h2 className="display-6 fw-bold text-gradient">{analytics.jobs}</h2>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card-main p-4 bg-white shadow-sm stat-card-rose">
            <h6 className="text-muted mb-1 fs-7 fw-semibold text-uppercase">Applications</h6>
            <h2 className="display-6 fw-bold text-gradient">{analytics.applications}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-pills-custom mb-4">
        <button className={`tab-pill ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={16} className="me-1" /> User Management
        </button>
        <button className={`tab-pill ${activeTab === 'companies' ? 'active' : ''}`} onClick={() => setActiveTab('companies')}>
          <Building2 size={16} className="me-1" /> Registered Companies ({companies.length})
        </button>
        <button className={`tab-pill ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
          <Activity size={16} className="me-1" /> System Activity
        </button>
        <button className={`tab-pill ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>
          <BarChart2 size={16} className="me-1" /> Hiring Analytics
        </button>
      </div>

      {error && <div className="alert alert-danger py-2 fs-7 rounded shadow-sm mb-3">{error}</div>}
      {success && <div className="alert alert-success py-2 fs-7 rounded shadow-sm mb-3">{success}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : activeTab === 'users' ? (
        /* Users tab */
        <div className="card-main bg-white shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr className="fs-8 text-muted text-uppercase">
                  <th>User ID</th>
                  <th>Profile Photo</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>
                      <img 
                        src={u.profilePhotoUrl || '/images/avatars/default-avatar.png'} 
                        alt="Profile" 
                        className="rounded-circle border" 
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/images/avatars/default-avatar.png' }}
                      />
                    </td>
                    <td className="fw-semibold text-dark">
                      <Link to={`/profile/${u.email}`} className="text-dark text-decoration-none hover-text-primary">
                        {u.fullName}
                      </Link>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(u.role.name)} px-2 py-1`}>
                        {u.role.name.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td>
                      {u.status === 'ACTIVE' ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2">Active</span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2">Suspended</span>
                      )}
                    </td>
                    <td className="text-end">
                      {u.role.name !== 'ROLE_ADMIN' ? (
                        <button 
                          className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleBlock(u.id)}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-muted fs-8">System Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'companies' ? (
        /* Companies Directory Tab */
        <div className="row g-4">
          {companies.map(comp => (
            <div key={comp.id} className="col-md-6 col-lg-4">
              <div className="card-main p-4 bg-white shadow-sm h-100 card-hover-border">
                <div className="d-flex align-items-center gap-3 mb-3 border-bottom pb-2">
                  <div 
                    className="bg-light rounded border p-1 flex-shrink-0"
                    style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <img src={comp.logoUrl} alt="Logo" className="img-fluid" style={{ maxHeight: '100%' }} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">
                      <Link to={`/companies/${comp.id}`} className="text-dark text-decoration-none hover-text-primary">
                        {comp.name}
                      </Link>
                    </h5>
                    <span className="text-muted fs-8">{comp.industry}</span>
                  </div>
                </div>
                <ul className="list-unstyled fs-8 text-muted mb-0">
                  <li className="mb-1"><MapPin size={12} /> {comp.location}</li>
                  <li className="mb-1"><Users size={12} /> Employees: {comp.size || '1,000+'}</li>
                  <li className="d-flex align-items-center gap-1"><Star size={12} className="text-warning fill-current" /> Glassdoor: {comp.glassdoorRating || '4.0'}</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'activity' ? (
        /* System Activity Log Tab */
        <div className="card-main p-4 bg-white shadow-sm">
          <h5 className="mb-4 text-dark fw-bold">Live Platform Events</h5>
          <div className="list-group list-group-flush">
            <div className="list-group-item px-0 py-3 d-flex align-items-start gap-3">
              <div className="bg-success-subtle text-success p-2 rounded-circle"><User size={16} /></div>
              <div>
                <p className="mb-1 text-dark">New candidate registration: <strong>Emma Watson</strong> (ROLE_JOBSEEKER)</p>
                <small className="text-muted">10 minutes ago</small>
              </div>
            </div>
            <div className="list-group-item px-0 py-3 d-flex align-items-start gap-3">
              <div className="bg-primary-subtle text-primary p-2 rounded-circle"><FileText size={16} /></div>
              <div>
                <p className="mb-1 text-dark">Job application submitted: <strong>Alex Mercer</strong> applied for <strong>Senior Software Engineer (Backend)</strong> at Google</p>
                <small className="text-muted">25 minutes ago</small>
              </div>
            </div>
            <div className="list-group-item px-0 py-3 d-flex align-items-start gap-3">
              <div className="bg-info-subtle text-info p-2 rounded-circle"><Building2 size={16} /></div>
              <div>
                <p className="mb-1 text-dark">Recruiter vacancy published: <strong>Sarah Connor</strong> posted <strong>Full Stack Engineer</strong> at Microsoft</p>
                <small className="text-muted">1 hour ago</small>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Hiring Analytics Trends Tab */
        <div className="card-main p-4 bg-white shadow-sm">
          <h5 className="mb-4 text-dark fw-bold">Hiring & Application Trends</h5>
          {chartData ? (
            <div style={{ height: '350px' }}>
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#f1f5f9' }
                    },
                    x: {
                      grid: { display: false }
                    }
                  },
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }}
              />
            </div>
          ) : (
            <p className="text-muted text-center">Chart data is unavailable.</p>
          )}
        </div>
      )}
    </div>
  )
}
