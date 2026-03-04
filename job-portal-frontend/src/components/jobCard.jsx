import { Link } from 'react-router-dom';
import './jobCard.css';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const typeColor = {
  'FULL_TIME': 'badge-success',
  'PART_TIME': 'badge-warning',
  'CONTRACT': 'badge-accent',
  'INTERNSHIP': 'badge-teal',
  'REMOTE': 'badge-teal',
};

const formatType = (type) => {
  if (!type) return '';
  return type.replace(/_/g, '-').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const formatLevel = (level) => {
  if (!level) return '';
  return level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

export default function JobCard({ job, applied = false, compact = false }) {
  const initials = job.companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link to={`/jobs/${job.id}`} className={`job-card ${compact ? 'job-card--compact' : ''} ${applied ? 'job-card--applied' : ''}`}>
      <div className="job-card__header">
        <div className="job-card__company-logo">{initials}</div>
        <div className="job-card__meta">
<span className={`badge ${typeColor[job.type] || 'badge-muted'}`}>{formatType(job.type)}</span>          {applied && <span className="badge badge-success">✓ Applied</span>}
        </div>
      </div>

      <div className="job-card__body">
        <h3 className="job-card__title">{job.title}</h3>
        <p className="job-card__company">{job.companyName}</p>
        <div className="job-card__details">
          <span className="job-card__detail">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
          <span className="job-card__detail">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.salary}
          </span>
        </div>
      </div>

      {!compact && job.skills && job.skills.length > 0 && (
              <div className="job-card__skills">
                {job.skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="job-card__skill">{skill}</span>
                ))}
                {job.skills.length > 4 && (
                  <span className="job-card__skill job-card__skill--more">+{job.skills.length - 4}</span>
                )}
              </div>
            )}

      <div className="job-card__footer">
              <span className="job-card__level">{formatLevel(job.level)}</span>
              <span className="job-card__time">{timeAgo(job.createdAt)}</span>
            </div>

      <div className="job-card__hover-arrow">→</div>
    </Link>
  );
}
