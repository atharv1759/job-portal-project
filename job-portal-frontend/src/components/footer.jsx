import { Link } from 'react-router-dom';
import './footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-icon">⬡</span>
            <span>HireFlow</span>
          </Link>
          <p className="footer__tagline">
            Connecting great talent with great companies. Find your next opportunity today.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>For Job Seekers</h4>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/login">Sign In</Link>
          </div>
          <div className="footer__col">
            <h4>For Companies</h4>
            <Link to="/register">Post a Job</Link>
            <Link to="/company/dashboard">Dashboard</Link>
          </div>
          <div className="footer__col">
            <h4>Platform</h4>
            <span>About HireFlow</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} HireFlow. Built with React.</p>
          <div className="footer__socials">
            <span>Twitter</span>
            <span>LinkedIn</span>
            <span>GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
