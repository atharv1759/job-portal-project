import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register } from '../services/authService';
import './auth.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: searchParams.get('role') || 'jobseeker',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const session = register({ name: form.name, email: form.email, password: form.password, role: form.role });
      if (session.role === 'company') navigate('/company/dashboard');
      else navigate('/jobs');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-visual">
        <div className="auth-visual__content">
          <div className="auth-logo">
            <span className="auth-logo__icon">⬡</span>
            <span className="auth-logo__text">HireFlow</span>
          </div>
          <h2 className="auth-visual__title">
            {form.role === 'company'
              ? 'Find your next great hire today'
              : 'Start your career journey here'}
          </h2>
          <p className="auth-visual__sub">
            {form.role === 'company'
              ? 'Post jobs, manage applications, and build your dream team — all in one place.'
              : 'Browse thousands of opportunities and apply with just a few clicks.'}
          </p>
          <div className="auth-visual__perks">
            {form.role === 'company' ? (
              <>
                <div className="auth-perk">✓ Post unlimited job listings</div>
                <div className="auth-perk">✓ Manage applications in one dashboard</div>
                <div className="auth-perk">✓ Reach 15,000+ qualified candidates</div>
              </>
            ) : (
              <>
                <div className="auth-perk">✓ Access 2,400+ active job listings</div>
                <div className="auth-perk">✓ One-click application tracking</div>
                <div className="auth-perk">✓ Get noticed by 800+ companies</div>
              </>
            )}
          </div>
        </div>
        <div className="auth-visual__orb"></div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1>Create an account</h1>
            <p>Join HireFlow and get started today</p>
          </div>

          {/* Role Selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${form.role === 'jobseeker' ? 'active' : ''}`}
              onClick={() => setForm((f) => ({ ...f, role: 'jobseeker' }))}
            >
              <span>👤</span>
              <div>
                <strong>Job Seeker</strong>
                <p>Find your next role</p>
              </div>
            </button>
            <button
              type="button"
              className={`role-btn ${form.role === 'company' ? 'active' : ''}`}
              onClick={() => setForm((f) => ({ ...f, role: 'company' }))}
            >
              <span>🏢</span>
              <div>
                <strong>Company</strong>
                <p>Hire great talent</p>
              </div>
            </button>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{form.role === 'company' ? 'Company Name' : 'Full Name'}</label>
              <input
                name="name"
                type="text"
                className="form-control"
                placeholder={form.role === 'company' ? 'Acme Corp' : 'John Doe'}
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form__row">
              <div className="form-group">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  name="confirm"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><div className="spinner"></div> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
