import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../App'
import { Link } from 'react-router-dom'
import { 
  Brain, FileText, Send, Sparkles, AlertCircle, Award, CheckCircle, 
  Search, HelpCircle, Terminal, User, BookOpen, BookOpenCheck, Zap
} from 'lucide-react'

export default function AiHub() {
  const { user } = useContext(AuthContext)
  
  const [activeModule, setActiveModule] = useState('chatbot') // chatbot, resume, ats, gap, interview
  
  // Resumes list (for Resume Analyzer)
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [resumeAnalysis, setResumeAnalysis] = useState(null)
  const [loadingResume, setLoadingResume] = useState(false)

  // ATS Checker state
  const [atsForm, setAtsForm] = useState({ jobDescription: '', resumeText: '' })
  const [atsResult, setAtsResult] = useState(null)
  const [loadingAts, setLoadingAts] = useState(false)

  // Skill Gap state
  const [gapForm, setGapForm] = useState({ targetRole: 'Backend Developer', userSkills: '' })
  const [gapResult, setGapResult] = useState(null)
  const [loadingGap, setLoadingGap] = useState(false)

  // Interview Prep state
  const [prepForm, setPrepForm] = useState({ jobTitle: '', jobDescription: '', experienceLevel: 'Mid Level' })
  const [prepResult, setPrepResult] = useState(null)
  const [loadingPrep, setLoadingPrep] = useState(false)

  // Chatbot state
  const [chatInput, setChatInput] = useState('')
  const [chatLog, setChatLog] = useState([
    { role: 'bot', text: 'Hello! I am your AI Career Advisor. Ask me anything about resume writing, upskilling, or interview prep!', actionItems: [] }
  ])
  const [sendingChat, setSendingChat] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const res = await axios.get('/api/users/profile/resumes')
      setResumes(res.data)
      if (res.data.length > 0) {
        setSelectedResumeId(res.data[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // AI Chat call
  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || sendingChat) return
    
    const userMsg = chatInput.trim()
    setChatLog(prev => [...prev, { role: 'user', text: userMsg }])
    setChatInput('')
    setSendingChat(true)

    try {
      const res = await axios.post('/api/ai/chat', { message: userMsg })
      setChatLog(prev => [...prev, { role: 'bot', text: res.data.reply, actionItems: res.data.actionItems || [] }])
    } catch (err) {
      setChatLog(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error connecting to the career advisor engine.', actionItems: [] }])
    } finally {
      setSendingChat(false)
    }
  }

  // Resume analysis report
  const handleAnalyzeResume = async () => {
    if (!selectedResumeId) return
    setLoadingResume(true)
    setResumeAnalysis(null)
    setError('')
    try {
      const res = await axios.get(`/api/ai/resume/${selectedResumeId}`)
      setResumeAnalysis(res.data)
    } catch (err) {
      setError('Failed to analyze selected resume.')
    } finally {
      setLoadingResume(false)
    }
  }

  // ATS Check submit
  const handleAtsCheck = async (e) => {
    e.preventDefault()
    setLoadingAts(true)
    setAtsResult(null)
    try {
      const res = await axios.post('/api/ai/ats-check', atsForm)
      setAtsResult(res.data)
    } catch (err) {
      setError('ATS checker failed.')
    } finally {
      setLoadingAts(false)
    }
  }

  // Skill Gap submit
  const handleSkillGap = async (e) => {
    e.preventDefault()
    setLoadingGap(true)
    setGapResult(null)
    try {
      const res = await axios.post('/api/ai/skill-gap', gapForm)
      setGapResult(res.data)
    } catch (err) {
      setError('Skill Gap audit failed.')
    } finally {
      setLoadingGap(false)
    }
  }

  // Interview Questions submit
  const handlePrep = async (e) => {
    e.preventDefault()
    setLoadingPrep(true)
    setPrepResult(null)
    try {
      const res = await axios.post('/api/ai/interview-prep', prepForm)
      setPrepResult(res.data)
    } catch (err) {
      setError('Failed to generate preparation questions.')
    } finally {
      setLoadingPrep(false)
    }
  }

  const getActiveModuleHeader = () => {
    switch(activeModule) {
      case 'chatbot': return { title: 'AI Career Guidance Chatbot', icon: <Sparkles className="text-primary" />, desc: 'Ask any career-related questions.' }
      case 'resume': return { title: 'Resume Score Analyzer & Auditor', icon: <FileText className="text-primary" />, desc: 'Select a resume to get a detailed rating and structural analysis.' }
      case 'ats': return { title: 'Real-time ATS Compatibility Scanner', icon: <Award className="text-primary" />, desc: 'Paste the target job description and your resume text to test alignment.' }
      case 'gap': return { title: 'Skill Gap Audit & Resource Advisor', icon: <Terminal className="text-primary" />, desc: 'Review gaps and study references for your target career path.' }
      case 'interview': return { title: 'AI Interview Prep Assistant', icon: <HelpCircle className="text-primary" />, desc: 'Generate interview questions customized for a job title and experience level.' }
      default: return { title: 'AI Career Hub', icon: <Brain className="text-primary" />, desc: '' }
    }
  }

  const activeHeader = getActiveModuleHeader();

  return (
    <div className="animate-fade-in text-dark row g-4">
      {/* Side Selector Menu */}
      <div className="col-lg-3">
        <div className="card-main p-3 bg-white shadow-sm">
          <h5 className="px-3 py-2 text-dark fw-bold d-flex align-items-center gap-2">
            <Brain className="text-primary" /> AI Career Hub
          </h5>
          <div className="nav flex-column nav-pills mt-2">
            <button 
              className={`nav-link text-start mb-2 py-2 px-3 fw-medium ${activeModule === 'chatbot' ? 'btn-grad-primary text-white border-0' : 'btn-outline-glass border-0 text-dark'}`}
              onClick={() => setActiveModule('chatbot')}
            >
              <Sparkles size={16} className="me-2" /> Career Chatbot
            </button>
            <button 
              className={`nav-link text-start mb-2 py-2 px-3 fw-medium ${activeModule === 'resume' ? 'btn-grad-primary text-white border-0' : 'btn-outline-glass border-0 text-dark'}`}
              onClick={() => setActiveModule('resume')}
            >
              <FileText size={16} className="me-2" /> Resume Analyzer
            </button>
            <button 
              className={`nav-link text-start mb-2 py-2 px-3 fw-medium ${activeModule === 'ats' ? 'btn-grad-primary text-white border-0' : 'btn-outline-glass border-0 text-dark'}`}
              onClick={() => setActiveModule('ats')}
            >
              <Award size={16} className="me-2" /> ATS Scanner
            </button>
            <button 
              className={`nav-link text-start mb-2 py-2 px-3 fw-medium ${activeModule === 'gap' ? 'btn-grad-primary text-white border-0' : 'btn-outline-glass border-0 text-dark'}`}
              onClick={() => setActiveModule('gap')}
            >
              <Terminal size={16} className="me-2" /> Skill Gap Audit
            </button>
            <button 
              className={`nav-link text-start mb-2 py-2 px-3 fw-medium ${activeModule === 'interview' ? 'btn-grad-primary text-white border-0' : 'btn-outline-glass border-0 text-dark'}`}
              onClick={() => setActiveModule('interview')}
            >
              <HelpCircle size={16} className="me-2" /> Interview Prep
            </button>
          </div>
        </div>
      </div>

      {/* Primary Display Console */}
      <div className="col-lg-9">
        {error && <div className="alert alert-danger py-2 fs-7 mb-4 rounded">{error}</div>}

        <div className="card-main p-4 bg-white shadow-sm mb-4">
          <h4 className="text-dark mb-1 d-flex align-items-center gap-2 fw-bold">
            {activeHeader.icon} {activeHeader.title}
          </h4>
          <p className="text-muted fs-7 mb-0">{activeHeader.desc}</p>
        </div>

        {activeModule === 'chatbot' && (
          /* MODULE 1: Chatbot */
          <div className="card-main p-4 d-flex flex-column bg-white shadow-sm" style={{ height: '550px' }}>
            
            {/* Messages box */}
            <div className="flex-grow-1 overflow-y-auto mb-3 px-2" style={{ maxHeight: '380px' }}>
              {chatLog.map((chat, idx) => (
                <div key={idx} className={`d-flex flex-column ${chat.role === 'user' ? 'align-items-end' : 'align-items-start'}`}>
                  <div className={`chat-bubble ${chat.role === 'user' ? 'user' : 'bot'}`}>
                    <div className="fs-7">{chat.text}</div>
                    {chat.actionItems && chat.actionItems.length > 0 && (
                      <div className="mt-2 border-top pt-2 fs-8" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                        <strong>Suggested Steps:</strong>
                        <ul className="ps-3 mb-0 mt-1">
                          {chat.actionItems.map((item, id) => <li key={id}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sendingChat && (
                <div className="chat-bubble bot text-muted fs-8">AI Advisor is writing...</div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="input-group">
              <input 
                type="text" 
                className="form-control input-main" 
                placeholder="Ask me: 'Give me technical tips for Java interview'..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-grad-primary px-4"><Send size={16} /></button>
            </form>
          </div>
        )}

        {activeModule === 'resume' && (
          /* MODULE 2: Resume Analyzer */
          <div className="card-main p-4 bg-white shadow-sm">

            {resumes.length === 0 ? (
              <div className="alert alert-info py-2 fs-7 text-center rounded">
                No uploaded resumes found. Upload your resume in the **Job Seeker Dashboard** profile tab to use this tool.
              </div>
            ) : (
              <div className="d-flex gap-3 mb-4 flex-wrap">
                <select 
                  className="form-select input-main flex-grow-1"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                >
                  {resumes.map(r => <option key={r.id} value={r.id}>{r.fileName}</option>)}
                </select>
                <button 
                  className="btn btn-grad-primary" 
                  onClick={handleAnalyzeResume}
                  disabled={loadingResume}
                >
                  {loadingResume ? 'Auditing...' : 'Run AI Audit'}
                </button>
              </div>
            )}

            {resumeAnalysis && (
              <div className="p-4 border rounded bg-light animate-fade-in text-dark">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold m-0">{resumeAnalysis.fileName}</h5>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill">
                    Score: {resumeAnalysis.score}/100
                  </span>
                </div>
                
                <p className="fw-bold mb-1 text-primary">Assessment: {resumeAnalysis.rating}</p>
                
                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <div className="card border-0 bg-white p-3 h-100 shadow-sm">
                      <h6 className="fw-bold text-success">Key Strengths</h6>
                      <ul className="ps-3 mb-0 fs-7 text-muted">
                        {resumeAnalysis.strengths?.map((item, idx) => <li key={idx} className="mb-1">{item}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 bg-white p-3 h-100 shadow-sm">
                      <h6 className="fw-bold text-danger">Identified Gaps</h6>
                      <ul className="ps-3 mb-0 fs-7 text-muted">
                        {resumeAnalysis.gaps?.map((item, idx) => <li key={idx} className="mb-1">{item}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="card border-0 bg-white p-3 shadow-sm">
                      <h6 className="fw-bold text-primary">AI Career Recommendations</h6>
                      <ul className="ps-3 mb-0 fs-7 text-muted">
                        {resumeAnalysis.recommendations?.map((item, idx) => <li key={idx} className="mb-1">{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeModule === 'ats' && (
          /* MODULE 3: ATS Scanner */
          <div className="card-main p-4 bg-white shadow-sm">

            <form onSubmit={handleAtsCheck}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark fs-7">Job Description</label>
                  <textarea 
                    className="form-control input-main" 
                    rows="6" 
                    placeholder="Paste job posting details here..."
                    value={atsForm.jobDescription}
                    onChange={(e) => setAtsForm({ ...atsForm, jobDescription: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark fs-7">Resume Text / Content</label>
                  <textarea 
                    className="form-control input-main" 
                    rows="6" 
                    placeholder="Paste parsed resume text here..."
                    value={atsForm.resumeText}
                    onChange={(e) => setAtsForm({ ...atsForm, resumeText: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>
              <button type="submit" className="btn btn-grad-primary w-100 py-2 mb-4" disabled={loadingAts}>
                {loadingAts ? 'Scanning Keywords...' : 'Scan Compatibility'}
              </button>
            </form>

            {atsResult && (
              <div className="p-4 border rounded bg-light animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold m-0 text-dark">ATS Match Report</h5>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-bold">
                    Score: {atsResult.score}%
                  </span>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-success fs-7">Matched Keywords</h6>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {atsResult.matchedKeywords?.length === 0 ? (
                        <span className="text-muted fs-8">None</span>
                      ) : (
                        atsResult.matchedKeywords?.map((kw, idx) => (
                          <span key={idx} className="badge bg-success text-white">{kw}</span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-danger fs-7">Missing Keywords</h6>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {atsResult.missingKeywords?.length === 0 ? (
                        <span className="text-muted fs-8">None</span>
                      ) : (
                        atsResult.missingKeywords?.map((kw, idx) => (
                          <span key={idx} className="badge bg-danger text-white">{kw}</span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="col-12 mt-3 pt-3 border-top">
                    <h6 className="fw-bold text-dark fs-7">Actionable Enhancements</h6>
                    <ul className="ps-3 mb-0 text-muted fs-7">
                      {atsResult.suggestions?.map((item, idx) => <li key={idx} className="mb-1">{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeModule === 'gap' && (
          /* MODULE 4: Skill Gap Audit */
          <div className="card-main p-4 bg-white shadow-sm">

            <form onSubmit={handleSkillGap}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark fs-7">Target Professional Role</label>
                  <select 
                    className="form-select input-main"
                    value={gapForm.targetRole}
                    onChange={(e) => setGapForm({ ...gapForm, targetRole: e.target.value })}
                  >
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Full Stack Engineer">Full Stack Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark fs-7">Current Tech Stack (comma separated)</label>
                  <input 
                    type="text" 
                    className="form-control input-main" 
                    placeholder="e.g. Java, HTML, CSS, SQL"
                    value={gapForm.userSkills}
                    onChange={(e) => setGapForm({ ...gapForm, userSkills: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-grad-primary w-100 py-2 mb-4" disabled={loadingGap}>
                {loadingGap ? 'Calculating Gaps...' : 'Audit Skills'}
              </button>
            </form>

            {gapResult && (
              <div className="p-4 border rounded bg-light animate-fade-in text-dark">
                <h5 className="fw-bold mb-3">Path Audit: {gapResult.role}</h5>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-success fs-7">Your Matched Skills</h6>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {gapResult.currentSkills?.map((skill, idx) => (
                        <span key={idx} className="badge bg-success text-white">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-danger fs-7">Gaps Detected</h6>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {gapResult.missingSkills?.map((skill, idx) => (
                        <span key={idx} className="badge bg-danger text-white">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  {gapResult.learningResources && Object.keys(gapResult.learningResources).length > 0 && (
                    <div className="col-12 mt-3 pt-3 border-top">
                      <h6 className="fw-bold text-dark fs-7">Recommended Learning Roadmaps</h6>
                      <div className="row g-2 mt-2">
                        {Object.entries(gapResult.learningResources).map(([skill, resource], idx) => (
                          <div key={idx} className="col-md-6">
                            <div className="card p-3 border-0 bg-white shadow-sm h-100">
                              <span className="fw-bold text-primary mb-1">{skill}</span>
                              <span className="text-muted fs-8">{resource}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeModule === 'interview' && (
          /* MODULE 5: Interview Prep */
          <div className="card-main p-4 bg-white shadow-sm">

            <form onSubmit={handlePrep}>
              <div className="row g-3 mb-3">
                <div className="col-md-5">
                  <label className="form-label fw-semibold text-dark fs-7">Job Title</label>
                  <input 
                    type="text" 
                    className="form-control input-main" 
                    placeholder="e.g. Senior Java Developer"
                    value={prepForm.jobTitle}
                    onChange={(e) => setPrepForm({ ...prepForm, jobTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-dark fs-7">Experience Level</label>
                  <select 
                    className="form-select input-main"
                    value={prepForm.experienceLevel}
                    onChange={(e) => setPrepForm({ ...prepForm, experienceLevel: e.target.value })}
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button type="submit" className="btn btn-grad-primary w-100 py-2" disabled={loadingPrep}>
                    {loadingPrep ? 'Generating...' : 'Get Questions'}
                  </button>
                </div>
              </div>
            </form>

            {prepResult && (
              <div className="p-4 border rounded bg-light animate-fade-in text-dark">
                <h5 className="fw-bold mb-3 border-bottom pb-2">Questions Generated for: {prepResult.jobTitle}</h5>
                
                <div className="mb-4">
                  <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-1">
                    <Zap size={16} /> Technical Questions
                  </h6>
                  <ol className="ps-3 text-muted fs-7">
                    {prepResult.technical?.map((q, idx) => <li key={idx} className="mb-2">{q}</li>)}
                  </ol>
                </div>
                
                <div>
                  <h6 className="fw-bold text-purple mb-2 d-flex align-items-center gap-1">
                    <User size={16} className="text-purple" /> Behavioral Questions
                  </h6>
                  <ol className="ps-3 text-muted fs-7">
                    {prepResult.behavioral?.map((q, idx) => <li key={idx} className="mb-2">{q}</li>)}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
