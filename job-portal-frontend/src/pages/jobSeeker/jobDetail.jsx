import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById } from '../../services/jobService';
import { applyToJob, hasApplied } from '../../services/appliacationService';
import { getSession } from '../../services/authService';
import './jobDetail.css';

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
};

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [session, setSession] = useState(null);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
const [appForm, setAppForm] = useState({ coverLetter: '', phone: '', portfolio: '', resumeUrl: '' });
const [resumeFile, setResumeFile] = useState(null);
const [uploading, setUploading] = useState(false);
const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadJob = async () => {
      const s = getSession();
      setSession(s);
      try {
        const j = await getJobById(id);
        console.log('Job data received:', j); // Debug log
        if (!j) {
          console.error('Job not found');
          navigate('/jobs');
          return;
        }
        setJob(j);
        if (s?.role === 'jobseeker') {
          const alreadyApplied = await hasApplied(id);
          setApplied(alreadyApplied);
        }
      } catch (err) {
        console.error('Failed to load job:', err);
        navigate('/jobs');
      }
    };
    loadJob();
  }, [id, navigate]);

  const handleApply = () => {
    if (!session) { navigate('/login'); return; }
    if (session.role === 'company') return;
    setShowModal(true);
  };

 const handleResumeChange = async (e) => {
   const file = e.target.files[0];
   if (!file) return;

   // Validate file type
   const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
   if (!allowedTypes.includes(file.type)) {
     setError('Only PDF and Word documents are allowed');
     return;
   }

   // Validate file size (5MB)
   if (file.size > 5 * 1024 * 1024) {
     setError('File size must be less than 5MB');
     return;
   }

   setResumeFile(file);
   setError('');

   // Upload immediately
   setUploading(true);
   const formData = new FormData();
   formData.append('file', file);

   try {
       const sessionData = getSession();
       if (!sessionData?.token) {
         throw new Error('Please log in to upload resume');
       }

       const response = await fetch('http://localhost:8080/api/files/upload-resume', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${sessionData.token}`
         },
         body: formData,
       });

     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error || 'Failed to upload resume');
     }

     const data = await response.json();
     setAppForm(f => ({ ...f, resumeUrl: data.url }));
   } catch (err) {
     setError(err.message || 'Failed to upload resume. Please try again.');
     setResumeFile(null);
   } finally {
     setUploading(false);
   }
 };

  const handleSubmitApp = async (e) => {
    e.preventDefault();

    if (!appForm.resumeUrl) {
      setError('Please upload your resume');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await applyToJob(id, { ...appForm });
      setSuccess(true);
      setApplied(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setResumeFile(null);
        setAppForm({ coverLetter: '', phone: '', portfolio: '', resumeUrl: '' });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return (
    <div className="page-wrapper container">
      <div className="job-skeleton" style={{height: '400px', borderRadius: 'var(--radius-lg)'}}></div>
    </div>
  );

  // Format enums from backend format to display format
  const formatType = (type) => {
    if (!type) return '';
    return type.replace(/_/g, '-').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatLevel = (level) => {
    if (!level) return '';
    return level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const daysUntilDeadline = job.deadline ? Math.ceil((new Date(job.deadline) - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="job-detail-page page-wrapper">
      <div className="container">
        <Link to="/jobs" className="back-link">
          ← Back to all jobs
        </Link>

        <div className="job-detail-layout">
          {/* Main Content */}
          <div className="job-detail-main">
            {/* Job Header */}
            <div className="job-detail-header card">
              <div className="jdh-top">
                <div className="jdh-logo">
                  {job.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="jdh-info">
                  <div className="jdh-badges">
                    <span className={`badge badge-${job.type === 'REMOTE' ? 'teal' : 'accent'}`}>{formatType(job.type)}</span>
                    <span className="badge badge-muted">{formatLevel(job.level)}</span>
                    <span className="badge badge-muted">{job.category}</span>
                    {applied && <span className="badge badge-success">✓ Applied</span>}
                  </div>
                  <h1 className="jdh-title">{job.title}</h1>
                  <p className="jdh-company">{job.companyName}</p>
                </div>
              </div>

              <div className="jdh-details">
                <div className="jdh-detail-item">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {job.location}
                </div>
                <div className="jdh-detail-item">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {job.salary}
                </div>
                <div className="jdh-detail-item">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Posted {timeAgo(job.createdAt)}
                </div>
                <div className="jdh-detail-item">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                  </svg>
                  {daysUntilDeadline !== null && daysUntilDeadline > 0 ? `${daysUntilDeadline} days remaining` : daysUntilDeadline !== null ? 'Deadline passed' : 'No deadline'}
                </div>
                <div className="jdh-detail-item">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {job.applicationCount || 0} applicant{(job.applicationCount || 0) !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="jdh-skills">
                  {job.skills.map((s) => (
                    <span key={s} className="badge badge-muted">{s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="job-detail-section card">
              <h2>About the Role</h2>
              <div className="job-description">
                {job.description && job.description.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="job-detail-section card">
                <h2>Requirements</h2>
                <div className="job-requirements">
                  {job.requirements.split(',').map((req, i) => (
                    <div key={i} className="requirement-item">
                      <span className="requirement-dot"></span>
                      {req.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="job-detail-section card">
                <h2>Benefits & Perks</h2>
                <div className="benefits-grid">
                  {job.benefits.map((b) => (
                    <div key={b} className="benefit-item">
                      <span>✓</span> {b}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="job-detail-sidebar">
            <div className="apply-card card">
              <div className="apply-deadline">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Apply by {formatDate(job.deadline)}
              </div>

              {session?.role === 'company' ? (
                <div className="alert alert-info">Companies cannot apply to jobs.</div>
              ) : applied ? (
                <button className="btn btn-secondary btn-full" disabled>
                  ✓ Application Submitted
                </button>
              ) : (
                <button className="btn btn-primary btn-full" onClick={handleApply}>
                  Apply Now
                </button>
              )}

              {!session && (
                <p className="apply-note">
                  <Link to="/login">Sign in</Link> or <Link to="/register">create an account</Link> to apply
                </p>
              )}

              <div className="apply-stats">
                <div className="apply-stat">
                  <strong>{job.applicationCount || 0}</strong>
                  <span>Applicants</span>
                </div>
                <div className="apply-stat">
                  <strong>{daysUntilDeadline && daysUntilDeadline > 0 ? daysUntilDeadline : 0}</strong>
                  <span>Days Left</span>
                </div>
              </div>
            </div>

            <div className="company-card card">
              <h3>About {job.companyName}</h3>
              <div className="company-logo-lg">
                {job.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <p className="company-name">{job.companyName}</p>
              <div className="company-meta">
                <span className="badge badge-muted">{job.category}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Apply for {job.title}</h2>
                <p>{job.companyName}</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {success ? (
              <div className="modal-success">
                <div className="modal-success__icon">🎉</div>
                <h3>Application Submitted!</h3>
                <p>Good luck with your application to {job.companyName}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApp} className="modal-form">
                {error && <div className="alert alert-error">⚠ {error}</div>}

<div className="form-group">
  <label>Resume <span className="required">*</span></label>
  <div className="file-upload-wrapper">
    <input
      type="file"
      id="resume-upload"
      className="file-input"
      accept=".pdf,.doc,.docx"
      onChange={handleResumeChange}
      disabled={uploading}
    />
    <label htmlFor="resume-upload" className="file-upload-label">
      {uploading ? (
        <>
          <div className="spinner"></div> Uploading...
        </>
      ) : resumeFile ? (
        <>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          {resumeFile.name}
        </>
      ) : (
        <>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          Choose file (PDF or Word)
        </>
      )}
    </label>
    <p className="file-upload-hint">Maximum file size: 5MB</p>
  </div>
</div>
                <div className="form-group">
                  <label>Cover Letter <span>(optional)</span></label>
                  <textarea
                    className="form-control"
                    placeholder="Tell them why you're a great fit for this role..."
                    value={appForm.coverLetter}
                    onChange={(e) => setAppForm(f => ({ ...f, coverLetter: e.target.value }))}
                    rows={6}
                  />
                </div>

                <div className="modal-form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={appForm.phone}
                      onChange={(e) => setAppForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Portfolio URL <span>(optional)</span></label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://yoursite.com"
                      value={appForm.portfolio}
                      onChange={(e) => setAppForm(f => ({ ...f, portfolio: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <><div className="spinner"></div> Submitting...</> : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}