import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllJobs, JOB_TYPES_LIST, JOB_LEVELS_LIST, JOB_CATEGORIES } from '../../services/jobService';
import { getApplicationsByApplicant } from '../../services/appliacationService';
import { getSession } from '../../services/authService';
import JobCard from '../../components/jobCard';
import './jobList.css';

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || 'all',
    level: searchParams.get('level') || 'all',
    category: searchParams.get('category') || 'all',
    location: searchParams.get('location') || '',
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  useEffect(() => {
    const loadAppliedJobs = async () => {
      const session = getSession();
      if (session?.role === 'jobseeker') {
        try {
          const apps = await getApplicationsByApplicant();
          setAppliedIds(new Set(apps.map((a) => a.jobId)));
        } catch (err) {
          console.error('Failed to load applications:', err);
        }
      }
    };
    loadAppliedJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getAllJobs(filters);
      setJobs(response.content || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    const params = {};
    Object.entries(updated).forEach(([k, v]) => { if (v && v !== 'all') params[k] = v; });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const reset = { search: '', type: 'all', level: 'all', category: 'all', location: '' };
    setFilters(reset);
    setSearchParams({});
  };

  const activeFilters = Object.values(filters).filter((v) => v && v !== 'all').length;

  return (
    <div className="job-list-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="job-list-header">
          <div>
            <h1 className="page-title">Browse Jobs</h1>
            <p className="page-subtitle">{loading ? 'Loading...' : `${jobs.length} opportunity${jobs.length !== 1 ? 'ies' : 'y'} found`}</p>
          </div>
          <button className="filter-toggle btn btn-secondary" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
            </svg>
            Filters {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
          </button>
        </div>

        {/* Search bar */}
        <div className="job-list-search">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search jobs, skills, companies..."
            className="job-list-search__input"
            value={filters.search}
            onChange={(e) => handleFilter('search', e.target.value)}
          />
          {filters.search && (
            <button onClick={() => handleFilter('search', '')} className="job-list-search__clear">×</button>
          )}
        </div>

        <div className="job-list-layout">
          {/* Sidebar Filters */}
          <aside className={`job-filters ${sidebarOpen ? 'job-filters--open' : ''}`}>
            <div className="job-filters__header">
              <h3>Filters</h3>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="job-filters__clear">Clear all</button>
              )}
            </div>

            <div className="job-filter-section">
              <label>Job Type</label>
              <div className="filter-options">
                {['all', ...JOB_TYPES_LIST].map((t) => (
                  <button
                    key={t}
                    className={`filter-option ${filters.type === t ? 'active' : ''}`}
                    onClick={() => handleFilter('type', t)}
                  >
                    {t === 'all' ? 'All Types' : t}
                  </button>
                ))}
              </div>
            </div>

            <div className="job-filter-section">
              <label>Experience Level</label>
              <div className="filter-options">
                {['all', ...JOB_LEVELS_LIST].map((l) => (
                  <button
                    key={l}
                    className={`filter-option ${filters.level === l ? 'active' : ''}`}
                    onClick={() => handleFilter('level', l)}
                  >
                    {l === 'all' ? 'All Levels' : l}
                  </button>
                ))}
              </div>
            </div>

            <div className="job-filter-section">
              <label>Category</label>
              <select
                className="form-control"
                value={filters.category}
                onChange={(e) => handleFilter('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="job-filter-section">
              <label>Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="City or Remote..."
                value={filters.location}
                onChange={(e) => handleFilter('location', e.target.value)}
              />
            </div>
          </aside>

          {/* Job Grid */}
          <div className="job-list-results">
            {loading ? (
              <div className="jobs-loading">
                {[1,2,3,4,5,6].map((n) => <div key={n} className="job-skeleton"></div>)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔍</div>
                <h3>No jobs found</h3>
                <p>Try adjusting your search filters or clear them to see more results.</p>
                <button onClick={clearFilters} className="btn btn-secondary" style={{marginTop: '16px'}}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobs.map((job, i) => (
                  <div key={job.id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-up">
                    <JobCard job={job} applied={appliedIds.has(job.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
