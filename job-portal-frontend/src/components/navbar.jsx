import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getSession, logout } from '../services/authService';
import './navbar.css';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSession(getSession());
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const handleLogout = () => {
    logout();
    setSession(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">⬡</span>
          <span className="navbar__logo-text">HireFlow</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links">
          <Link to="/" className={`navbar__link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/jobs" className={`navbar__link ${isActive('/jobs') ? 'active' : ''}`}>Browse Jobs</Link>
          {session?.role === 'company' && (
            <>
              <Link to="/company/dashboard" className={`navbar__link ${isActive('/company/dashboard') ? 'active' : ''}`}>Dashboard</Link>
              <Link to="/company/post-job" className={`navbar__link ${isActive('/company/post-job') ? 'active' : ''}`}>Post Job</Link>
            </>
          )}
          {session?.role === 'jobseeker' && (
            <Link to="/applications" className={`navbar__link ${isActive('/applications') ? 'active' : ''}`}>My Applications</Link>
          )}
        </nav>

        {/* CTA */}
        <div className="navbar__cta">
          {session ? (
            <div className="navbar__user">
              <div className="navbar__user-info">
                <div className="navbar__avatar">{session.name.charAt(0).toUpperCase()}</div>
                <div className="navbar__user-details">
                  <span className="navbar__user-name">{session.name}</span>
                  <span className={`badge badge-${session.role === 'company' ? 'teal' : 'accent'}`}>
                    {session.role === 'company' ? 'Company' : 'Job Seeker'}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="navbar__toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile" onClick={() => setMenuOpen(false)}>
          <Link to="/" className="navbar__mobile-link">Home</Link>
          <Link to="/jobs" className="navbar__mobile-link">Browse Jobs</Link>
          {session?.role === 'company' && (
            <>
              <Link to="/company/dashboard" className="navbar__mobile-link">Dashboard</Link>
              <Link to="/company/post-job" className="navbar__mobile-link">Post Job</Link>
            </>
          )}
          {session?.role === 'jobseeker' && (
            <Link to="/applications" className="navbar__mobile-link">My Applications</Link>
          )}
          {session ? (
            <button onClick={handleLogout} className="navbar__mobile-link navbar__mobile-logout">Sign Out</button>
          ) : (
            <>
              <Link to="/login" className="navbar__mobile-link">Sign In</Link>
              <Link to="/register" className="navbar__mobile-link">Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
