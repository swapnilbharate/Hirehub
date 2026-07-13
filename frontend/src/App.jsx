import React, { createContext, useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import { Briefcase, LogOut, Bell, Compass, LayoutDashboard, BrainCircuit, User } from 'lucide-react'

// Configure Axios Base URL for Production
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';

// Import Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AiHub from './pages/AiHub'
import UserProfile from './pages/UserProfile'
import CompanyProfile from './pages/CompanyProfile'
import JobDetail from './pages/JobDetail'

// Create Contexts
export const AuthContext = createContext(null)

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  // Hydrate auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('hirehub_user')
    const token = localStorage.getItem('hirehub_token')
    
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser)
      setUser({ ...parsedUser, token })
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchNotifications()
    }
    setLoading(false)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/users/notifications')
      setNotifications(res.data)
    } catch (err) {
      console.error("Failed to load notifications", err)
    }
  }

  const login = (userData, token) => {
    setUser({ ...userData, token })
    localStorage.setItem('hirehub_user', JSON.stringify(userData))
    localStorage.setItem('hirehub_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    fetchNotifications()
  };

  const logout = useCallback(() => {
    setUser(null)
    setNotifications([])
    localStorage.removeItem('hirehub_user')
    localStorage.removeItem('hirehub_token')
    delete axios.defaults.headers.common['Authorization']
  }, [])

  // Handle Token Expiration Globally (401 Unauthorized / 403 Forbidden)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Token expired, invalid, or user no longer exists
          logout();
          alert("Your session has expired or is invalid. Please log in again.");
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light text-dark">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, notifications, refreshNotifications: fetchNotifications }}>
      <Router>
        <Navigation />
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <DashboardRedirect /> : <Login />} />
            <Route path="/register" element={user ? <DashboardRedirect /> : <Register />} />
            
            {/* Company and Job Detail routes */}
            <Route path="/companies/:id" element={<CompanyProfile />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/seeker-dashboard" element={<ProtectedRoute roles={['ROLE_JOBSEEKER']}><JobSeekerDashboard /></ProtectedRoute>} />
            <Route path="/recruiter-dashboard" element={<ProtectedRoute roles={['ROLE_RECRUITER']}><RecruiterDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/ai-hub" element={<ProtectedRoute><AiHub /></ProtectedRoute>} />
            
            {/* User Profile routes */}
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/profile/:email" element={<UserProfile />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthContext.Provider>
  )
}

function Navigation() {
  const { user, logout, notifications, refreshNotifications } = React.useContext(AuthContext)
  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleReadAll = async () => {
    try {
      await axios.post('/api/users/read-all-notifications')
      refreshNotifications()
    } catch (err) {
      try {
        await axios.post('/api/users/notifications/read-all')
        refreshNotifications()
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-main">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fs-4" to="/" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
          <Briefcase className="text-primary" size={28} />
          <span style={{ color: 'var(--text-primary)' }}>Hire<span className="text-gradient">Hub</span></span>
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center gap-1" to="/" style={{ fontWeight: 500 }}>
                <Compass size={18} /> Browse Jobs
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/dashboard" style={{ fontWeight: 500 }}>
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-1" to="/ai-hub" style={{ fontWeight: 500 }}>
                    <BrainCircuit size={18} /> AI Career Hub
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Notification Dropdown */}
                <div className="dropdown">
                  <button className="btn btn-link position-relative text-muted p-2" type="button" data-bs-toggle="dropdown" onClick={refreshNotifications}>
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end border-light p-2 shadow-sm" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto', backgroundColor: '#fff' }}>
                    <div className="d-flex justify-content-between align-items-center px-2 py-1 border-bottom mb-2">
                      <span className="text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button className="btn btn-sm btn-link text-primary p-0 text-decoration-none" onClick={handleReadAll} style={{ fontSize: '0.75rem' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <li className="text-muted text-center py-3" style={{ fontSize: '0.8rem' }}>No notifications yet.</li>
                    ) : (
                      notifications.map(n => (
                        <li key={n.id} className={`p-2 rounded mb-1`} style={{ fontSize: '0.8rem', backgroundColor: n.isRead ? 'transparent' : 'var(--bg-indigo-light)', color: 'var(--text-body)' }}>
                          {n.message}
                          <div className="text-muted" style={{ fontSize: '0.65rem', marginTop: '2px' }}>
                            {new Date(n.createdAt || Date.now()).toLocaleTimeString()}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                
                {/* Profile Dropdown */}
                <div className="dropdown">
                  <button className="btn btn-link d-flex align-items-center gap-2 text-decoration-none text-light p-0 border-0" type="button" data-bs-toggle="dropdown">
                    <img 
                      src={user.profilePhotoUrl || "/images/avatars/default-avatar.png"} 
                      alt="Profile" 
                      className="rounded-circle"
                      style={{ width: '36px', height: '36px', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                      onError={(e) => { e.target.src = "/images/avatars/default-avatar.png" }}
                    />
                    <span className="fw-semibold d-none d-md-inline" style={{ fontSize: '0.9rem' }}>{user.fullName}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-light" style={{ minWidth: '180px' }}>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/profile">
                        <User size={16} /> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/dashboard">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2 text-danger py-2" onClick={logout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link className="btn text-secondary text-decoration-none px-3" to="/login" style={{ fontWeight: 500 }}>Login</Link>
                <Link className="btn btn-grad-primary" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function DashboardRedirect() {
  const { user } = React.useContext(AuthContext)
  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin-dashboard" replace />
  if (user.role === 'ROLE_RECRUITER') return <Navigate to="/recruiter-dashboard" replace />
  return <Navigate to="/seeker-dashboard" replace />
}

function ProtectedRoute({ children, roles }) {
  const { user } = React.useContext(AuthContext)
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return children
}
