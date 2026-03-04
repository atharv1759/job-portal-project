import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../../services/authService';
import { getApplicationsByApplicant } from '../../services/appliacationService';
import { getJobById } from '../../services/jobService';
import './myApplications.css';

const STATUS_CONFIG = {
  pending:   { label: 'Under Review', className: 'badge-warning', icon: '⏳' },
  reviewed:  { label: 'Reviewed',     className: 'badge-accent',  icon: '👁' },
  shortlisted: { label: 'Shortlisted', className: 'badge-teal',   icon: '⭐' },
  rejected:  { label: 'Not Selected', className: 'badge-muted',   icon: '✕' },
  accepted:  { label: 'Accepted! 🎉', className: 'badge-success', icon: '✓' },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const loadApplications = async () => {
      const session = getSession();
      if (!session || session.role !== 'jobseeker') { navigate('/login'); return; }

      try {
        const apps = await getApplicationsByApplicant();
        setApplications(apps);
      } catch (err) {
        console.error('Failed to load applications:', err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [navigate]);

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
  };

  return (
    <div className="my-apps-page page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">Track all your job applications in one place</p>
        </div>

        {/* Stats */}
        <div className="apps-stats">
          <div className="app-stat-card">
            <div className="app-stat-value">{stats.total}</div>
            <div className="app-stat-label">Total Applied</div>
          </div>
          <div className="app-stat-card">
            <div className="app-stat-value app-stat-value--warning">{stats.pending}</div>
            <div className="app-stat-label">Under Review</div>
          </div>
          <div className="app-stat-card">
            <div className="app-stat-value app-stat-value--teal">{stats.shortlisted}</div>
            <div className="app-stat-label">Shortlisted</div>
          </div>
          <div className="app-stat-card">
            <div className="app-stat-value app-stat-value--success">{stats.accepted}</div>
            <div className="app-stat-label">Accepted</div>
          </div>
        </div>

        {/* Filters */}
        <div className="apps-filters">
          {['all', 'pending', 'shortlisted', 'accepted', 'rejected'].map((f) => (
            <button
              key={f}
              className={`apps-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${stats.total})` : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="apps-loading">
            {[1,2,3].map(n => <div key={n} className="job-skeleton" style={{height:'100px'}}></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">{applications.length === 0 ? '📋' : '🔍'}</div>
            <h3>{applications.length === 0 ? 'No applications yet' : 'No applications match'}</h3>
            <p>
              {applications.length === 0
                ? 'Start browsing jobs and apply to positions that interest you.'
                : 'Try selecting a different filter.'}
            </p>
            {applications.length === 0 && (
              <Link to="/jobs" className="btn btn-primary" style={{marginTop:'16px'}}>Browse Jobs</Link>
            )}
          </div>
        ) : (
          <div className="apps-list">
            {filtered.map((app) => {
              const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
              return (
                <div key={app.id} className="app-item fade-up">
                  <div className="app-item-logo">
                    {app.companyName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                  </div>

                  <div className="app-item-content">
                    <div className="app-item-top">
                      <div>
                        <Link to={`/jobs/${app.jobId}`} className="app-item-title">
                          {app.jobTitle}
                        </Link>
                        <p className="app-item-company">{app.companyName}</p>
                      </div>
                      <span className={`badge ${sc.className}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    <div className="app-item-meta">
                      <span className="badge badge-muted">{app.jobTitle}</span>
                      <span className="app-item-date">Applied {formatDate(app.createdAt)}</span>
                    </div>

                    {app.coverLetter && (
                      <p className="app-item-cover">
                        {app.coverLetter.slice(0, 150)}{app.coverLetter.length > 150 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
