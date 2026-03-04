import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import './auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = await login(form.email, form.password);
      if (session.role === 'COMPANY') navigate('/company/dashboard');
      else navigate('/jobs');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'jobseeker') setForm({ email: 'jobseeker@demo.com', password: 'demo123' });
    else setForm({ email: 'company@demo.com', password: 'demo123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual__content">
          <div className="auth-logo">
            <span className="auth-logo__icon">⬡</span>
            <span className="auth-logo__text">HireFlow</span>
          </div>
          <h2 className="auth-visual__title">Your next opportunity is one login away</h2>
          <p className="auth-visual__sub">Join thousands of professionals and companies on HireFlow.</p>
          <div className="auth-visual__stats">
            <div><strong>2,400+</strong><span>Active Jobs</span></div>
            <div><strong>800+</strong><span>Companies</span></div>
            <div><strong>94%</strong><span>Placement Rate</span></div>
          </div>
        </div>
        <div className="auth-visual__orb"></div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <div className="demo-creds">
            <p className="demo-creds__label">Try a demo account:</p>
            <div className="demo-creds__btns">
              <button className="demo-btn" onClick={() => fillDemo('jobseeker')}>👤 Job Seeker</button>
              <button className="demo-btn" onClick={() => fillDemo('company')}>🏢 Company</button>
            </div>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>


            <div className="divider">
              <span>OR</span>
            </div>

            <a
              href="http://localhost:8080/oauth2/authorization/google"
              className="btn btn-google btn-full"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Continue with Google
            </a>

            <p className="auth-footer">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
