import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getSession } from '../../services/authService';
import { createJob, updateJob, getJobById, JOB_TYPES_LIST, JOB_LEVELS_LIST, JOB_CATEGORIES } from '../../services/jobService';
import './postJob.css';

export default function PostJob() {
  const { id } = useParams(); // for edit mode
  const isEdit = !!id;
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    type: 'Full-time',
    level: 'Mid Level',
    category: 'Engineering',
    skills: '',
    benefits: '',
    deadline: '',
  });

  useEffect(() => {
    const initForm = async () => {
      const s = getSession();
      if (!s || s.role !== 'company') { navigate('/login'); return; }
      setSession(s);

      if (isEdit) {
        try {
          const job = await getJobById(id);
          if (!job || job.companyId !== s.userId) { navigate('/company/dashboard'); return; }
          setForm({
            ...job,
            skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills,
            benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : job.benefits,
            deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : '',
            type: job.type.replace('_', '-').toLowerCase(),
            level: job.level.replace('_', ' '),
            category: job.category,
          });
        } catch (err) {
          console.error('Failed to load job:', err);
          navigate('/company/dashboard');
        }
      } else {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setForm(f => ({ ...f, deadline: d.toISOString().slice(0, 10) }));
      }
    };
    initForm();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateJob(id, { ...form, deadline: new Date(form.deadline).toISOString() });
      } else {
        await createJob({ ...form, deadline: new Date(form.deadline).toISOString() });
      }
      setSuccess(true);
      setTimeout(() => navigate('/company/dashboard'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-page page-wrapper">
      <div className="container">
        <Link to="/company/dashboard" className="back-link">← Back to Dashboard</Link>

        <div className="post-job-layout">
          {/* Form */}
          <div className="post-job-form-wrapper">
            <div className="post-job-header">
              <h1 className="page-title">{isEdit ? 'Edit Job Listing' : 'Post a New Job'}</h1>
              <p className="page-subtitle">
                {isEdit ? 'Update your job listing details' : 'Fill in the details below to attract the best candidates'}
              </p>
            </div>

            {success && (
              <div className="alert alert-success">
                🎉 Job {isEdit ? 'updated' : 'posted'} successfully! Redirecting...
              </div>
            )}

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit} className="post-job-form">
              {/* Basic Info */}
              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="form-group">
                  <label>Job Title <span className="required">*</span></label>
                  <input
                    name="title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Senior React Developer"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label>Job Type</label>
                    <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                      {JOB_TYPES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Experience Level</label>
                    <select name="level" className="form-control" value={form.level} onChange={handleChange}>
                      {JOB_LEVELS_LIST.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" className="form-control" value={form.category} onChange={handleChange}>
                      {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Location <span className="required">*</span></label>
                    <input
                      name="location"
                      type="text"
                      className="form-control"
                      placeholder="e.g. New York, NY or Remote"
                      value={form.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Salary Range</label>
                    <input
                      name="salary"
                      type="text"
                      className="form-control"
                      placeholder="e.g. $80,000 – $120,000"
                      value={form.salary}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    name="deadline"
                    type="date"
                    className="form-control"
                    value={form.deadline}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-section">
                <h3>Job Description</h3>

                <div className="form-group">
                  <label>About the Role <span className="required">*</span></label>
                  <textarea
                    name="description"
                    className="form-control"
                    placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                    value={form.description}
                    onChange={handleChange}
                    rows={8}
                    required
                  />
                  <span className="form-hint">Tip: Use line breaks to separate sections like Responsibilities and What We Offer.</span>
                </div>

                <div className="form-group">
                  <label>Requirements</label>
                  <textarea
                    name="requirements"
                    className="form-control"
                    placeholder="e.g. 3+ years of React experience, TypeScript, REST APIs (separate with commas)"
                    value={form.requirements}
                    onChange={handleChange}
                    rows={4}
                  />
                  <span className="form-hint">Separate multiple requirements with commas.</span>
                </div>
              </div>

              {/* Skills & Benefits */}
              <div className="form-section">
                <h3>Skills & Benefits</h3>

                <div className="form-group">
                  <label>Required Skills</label>
                  <input
                    name="skills"
                    type="text"
                    className="form-control"
                    placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
                    value={form.skills}
                    onChange={handleChange}
                  />
                  <span className="form-hint">Separate skills with commas. These appear as tags on your listing.</span>
                </div>

                <div className="form-group">
                  <label>Benefits & Perks</label>
                  <input
                    name="benefits"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Health Insurance, Remote Options, 401k, Stock Options"
                    value={form.benefits}
                    onChange={handleChange}
                  />
                  <span className="form-hint">Separate benefits with commas.</span>
                </div>
              </div>

              {/* Submit */}
              <div className="post-job-actions">
                <Link to="/company/dashboard" className="btn btn-secondary">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={loading || success}>
                  {loading ? <><div className="spinner"></div> {isEdit ? 'Updating...' : 'Posting...'}</> :
                   success ? '✓ Done!' :
                   isEdit ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>

          {/* Tips Sidebar */}
          <aside className="post-job-tips">
            <div className="tips-card card">
              <h3>✦ Tips for a great listing</h3>
              <div className="tip-item">
                <strong>Be specific</strong>
                <p>Precise titles and clear descriptions attract better candidates.</p>
              </div>
              <div className="tip-item">
                <strong>List salary</strong>
                <p>Jobs with salary info get 30% more applications on average.</p>
              </div>
              <div className="tip-item">
                <strong>Highlight benefits</strong>
                <p>Remote options, health insurance, and growth opportunities are top priorities for candidates.</p>
              </div>
              <div className="tip-item">
                <strong>Use clear requirements</strong>
                <p>Separate must-haves from nice-to-haves to get qualified applicants.</p>
              </div>
            </div>

            <div className="preview-card card">
              <h3>📋 Preview</h3>
              {form.title ? (
                <>
                  <strong className="preview-title">{form.title}</strong>
                  <p className="preview-company">{session?.name}</p>
                  <div className="preview-badges">
                    <span className="badge badge-accent">{form.type}</span>
                    <span className="badge badge-muted">{form.level}</span>
                  </div>
                  {form.location && <p className="preview-detail">📍 {form.location}</p>}
                  {form.salary && <p className="preview-detail">💰 {form.salary}</p>}
                  {form.skills && (
                    <div className="preview-skills">
                      {form.skills.split(',').slice(0, 4).map((s, i) => s.trim() && (
                        <span key={i} className="badge badge-muted">{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="preview-empty">Fill in the form to see a preview of your job listing.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
