import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../../services/authService';
import { getJobsByCompany, deleteJob, updateJob, getApplicationsForJob, updateApplicationStatus } from '../../services/jobService';
import './companyDashboard.css';

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

const STATUS_CONFIG = {
  pending:     { label: 'Pending',      className: 'badge-warning' },
  reviewed:    { label: 'Reviewed',     className: 'badge-accent' },
  shortlisted: { label: 'Shortlisted',  className: 'badge-teal' },
  rejected:    { label: 'Rejected',     className: 'badge-muted' },
  accepted:    { label: 'Accepted',     className: 'badge-success' },
};

export default function CompanyDashboard() {
  const [session, setSession] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initDashboard = async () => {
      const s = getSession();
      if (!s || s.role !== 'company') { navigate('/login'); return; }
      setSession(s);
      await loadJobs(s.userId);
    };
    initDashboard();
  }, [navigate]);

  const loadJobs = async (companyId) => {
    try {
      const j = await getJobsByCompany();
      setJobs(j);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    try {
      const apps = await getApplicationsForJob(job.id);
      setApplications(apps);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    }
    setActiveTab('applications');
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await deleteJob(jobId);
      await loadJobs(session.userId);
      if (selectedJob?.id === jobId) { setSelectedJob(null); setApplications([]); setActiveTab('jobs'); }
    } catch (err) {
      console.error('Failed to delete job:', err);
      alert('Failed to delete job');
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      const updated = await updateJob(job.id, { status: job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE' });
      await loadJobs(session.userId);
      if (selectedJob?.id === job.id) setSelectedJob(updated);
    } catch (err) {
      console.error('Failed to update job:', err);
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      const apps = await getApplicationsForJob(selectedJob.id);
      setApplications(apps);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Stats
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
  const totalApps = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);
  const newApps = jobs.reduce((sum, j) => {
    return sum + (j.applications?.filter(a => {
      const diff = Date.now() - new Date(a.createdAt).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length || 0);
  }, 0);

  return (
    <div className="dashboard-page page-wrapper">
      <div className="container">
        {/* Page Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Company Dashboard</h1>
            <p className="page-subtitle">Welcome back, {session?.name}</p>
          </div>
          <Link to="/company/post-job" className="btn btn-primary">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          {[
            { label: 'Total Jobs', value: totalJobs, icon: '📋', color: '' },
            { label: 'Active Listings', value: activeJobs, icon: '✅', color: '--teal' },
            { label: 'Total Applications', value: totalApps, icon: '📩', color: '--accent' },
            { label: 'New This Week', value: newApps, icon: '🔥', color: '--warning' },
          ].map((stat) => (
            <div key={stat.label} className="dashboard-stat-card">
              <div className="dashboard-stat-icon">{stat.icon}</div>
              <div className="dashboard-stat-value" style={stat.color ? {color: `var(${stat.color})`} : {}}>
                {stat.value}
              </div>
              <div className="dashboard-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Job Listings <span className="tab-count">{totalJobs}</span>
          </button>
          {selectedJob && (
            <button
              className={`dashboard-tab ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              Applications for "{selectedJob.title}" <span className="tab-count">{applications.length}</span>
            </button>
          )}
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="dashboard-content">
            {loading ? (
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {[1,2,3].map(n=><div key={n} className="job-skeleton" style={{height:'80px'}}></div>)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📋</div>
                <h3>No job listings yet</h3>
                <p>Create your first job posting to start receiving applications.</p>
                <Link to="/company/post-job" className="btn btn-primary" style={{marginTop:'16px'}}>Post Your First Job</Link>
              </div>
            ) : (
              <div className="jobs-table">
                <div className="jobs-table-header">
                  <span>Job Title</span>
                  <span>Status</span>
                  <span>Applications</span>
                  <span>Posted</span>
                  <span>Actions</span>
                </div>
                {jobs.map((job) => (
                  <div key={job.id} className="jobs-table-row">
                    <div className="jobs-table-title">
                      <strong>{job.title}</strong>
                      <div className="jobs-table-meta">
                        <span className="badge badge-muted">{job.type}</span>
                        <span className="badge badge-muted">{job.level}</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`badge ${job.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>
                        {job.status === 'ACTIVE' ? '● Active' : '○ Closed'}
                      </span>
                    </div>
                    <div>
                      <button
                        className="apps-count-btn"
                        onClick={() => handleSelectJob(job)}
                      >
                        {job.applicationCount || 0} application{(job.applicationCount || 0) !== 1 ? 's' : ''}
                      </button>
                    </div>
                    <div className="jobs-table-date">{timeAgo(job.postedAt)}</div>
                    <div className="jobs-table-actions">
                      <Link to={`/company/edit-job/${job.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleToggleStatus(job)}>
                        {job.status === 'active' ? 'Close' : 'Reopen'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && selectedJob && (
          <div className="dashboard-content">
            <div className="apps-tab-header">
              <div>
                <h2>{selectedJob.title}</h2>
                <p>{applications.length} total application{applications.length !== 1 ? 's' : ''}</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('jobs')}>← Back to Jobs</button>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📭</div>
                <h3>No applications yet</h3>
                <p>Share your job listing to start receiving applications.</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app) => {
                  const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={app.id} className="application-card">
                      <div className="application-card-top">
                        <div className="applicant-info">
                          <div className="applicant-avatar">
                            {(app.applicantName || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3>{app.applicantName || 'Anonymous'}</h3>
                            <p>{app.applicantEmail}</p>
                            {app.phone && <p className="app-detail">📞 {app.phone}</p>}
                            {app.portfolio && (
                              <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="app-detail app-link">
                                🌐 Portfolio
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="application-card-status">
                          <span className={`badge ${sc.className}`}>{sc.label}</span>
                          <span className="app-date">{timeAgo(app.appliedAt)}</span>
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div className="cover-letter">
                          <p className="cover-letter-label">Cover Letter</p>
                          <p className="cover-letter-text">{app.coverLetter}</p>
                        </div>
                      )}

                      <div className="application-actions">
                        {['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map(s => (
                          <button
                            key={s}
                            className={`app-status-btn ${app.status === s ? 'active' : ''}`}
                            onClick={() => handleUpdateAppStatus(app.id, s)}
                          >
                            {STATUS_CONFIG[s]?.label || s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
