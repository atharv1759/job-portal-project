import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../services/authService';
import { getAllJobs } from '../services/jobService';
import JobCard from '../components/jobCard';
import './home.css';

const STATS = [
  { value: '2,400+', label: 'Active Jobs' },
  { value: '800+', label: 'Companies' },
  { value: '15K+', label: 'Job Seekers' },
  { value: '94%', label: 'Placement Rate' },
];

const CATEGORIES = [
  { name: 'Engineering', icon: '⚙️', count: ' jobs' },
  { name: 'Design', icon: '🎨', count: ' jobs' },
  { name: 'Marketing', icon: '📢', count: ' jobs' },
  { name: 'Data', icon: '📊', count: ' jobs' },
  { name: 'Product', icon: '🚀', count: ' jobs' },
  { name: 'Sales', icon: '💼', count: ' jobs' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSession(getSession());
    const fetchJobs = async () => {
      try {
        const response = await getAllJobs({ size: 3 });
        setFeaturedJobs(response.content || []);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setFeaturedJobs([]);
      }
    };
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb-1"></div>
          <div className="hero__orb hero__orb-2"></div>
          <div className="hero__grid"></div>
        </div>

        <div className="container hero__content">

          <h1 className="hero__title fade-up">
            Find Your <span className="hero__highlight">Dream Job</span>
            <br />Without the Friction
          </h1>
          <p className="hero__subtitle fade-up">
            HireFlow connects ambitious talent with forward-thinking companies.
            <br />Browse roles, apply instantly, get hired faster.
          </p>

          <form onSubmit={handleSearch} className="hero__search fade-up">
            <div className="hero__search-input">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Job title, skill, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              Search Jobs
            </button>
          </form>

          <div className="hero__tags fade-up">
            {['React Developer', 'UX Designer', 'Data Scientist', 'Product Manager', 'Remote'].map((tag) => (
              <button key={tag} className="hero__tag" onClick={() => navigate(`/jobs?search=${tag}`)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>



      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-sub">Find roles that match your expertise and passion</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/jobs?category=${cat.name}`}
                className="category-card"
              >
                <span className="category-icon">{cat.icon}</span>
                <h3 className="category-name">{cat.name}</h3>
                <span className="category-count">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Opportunities</h2>
              <Link to="/jobs" className="section-link">View all jobs →</Link>
            </div>
            <div className="featured-grid">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Split */}
      <section className="cta-split">
        <div className="container">
          <div className="cta-card cta-card--seeker">
            <div className="cta-card__icon">🔍</div>
            <h3>Looking for Work?</h3>
            <p>Create your profile and start applying to thousands of curated job listings today.</p>
            <Link
              to={session?.role === 'jobseeker' ? '/jobs' : '/register?role=jobseeker'}
              className="btn btn-primary"
            >
              {session?.role === 'jobseeker' ? 'Browse Jobs' : 'Find a Job'}
            </Link>
          </div>
          <div className="cta-divider">
            <span>or</span>
          </div>
          <div className="cta-card cta-card--company">
            <div className="cta-card__icon">🏢</div>
            <h3>Hiring Talent?</h3>
            <p>Post your job listing and reach thousands of qualified candidates instantly.</p>
            <Link
              to={session?.role === 'company' ? '/company/post-job' : '/register?role=company'}
              className="btn btn-outline"
            >
              {session?.role === 'company' ? 'Post a Job' : 'Start Hiring'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
