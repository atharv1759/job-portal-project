// jobService.js — Calls Spring Boot REST API

import { apiCall } from './authService';

// ===== PUBLIC JOB ENDPOINTS =====
export const getAllJobs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search)   params.set('search', filters.search);
  if (filters.type && filters.type !== 'all') params.set('type', filters.type.replace('-', '_').toUpperCase());
  if (filters.level && filters.level !== 'all') params.set('level', filters.level.replace(' ', '_').toUpperCase());
  if (filters.category && filters.category !== 'all') params.set('category', filters.category.toUpperCase());
  if (filters.location) params.set('location', filters.location);
  if (filters.page !== undefined) params.set('page', filters.page);
  if (filters.size !== undefined) params.set('size', filters.size || 20);

  const query = params.toString();
  return await apiCall(`/jobs${query ? '?' + query : ''}`);
};

export const getJobById = async (id) => {
  return await apiCall(`/jobs/${id}`);
};

// ===== COMPANY JOB MANAGEMENT =====
export const createJob = async (jobData) => {
  const payload = {
    ...jobData,
    type: jobData.type?.toUpperCase().replace('-', '_').replace(' ', '_'),
    level: jobData.level?.toUpperCase().replace(' ', '_'),
    category: jobData.category?.toUpperCase(),
    skills: typeof jobData.skills === 'string'
      ? jobData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : jobData.skills || [],
    benefits: typeof jobData.benefits === 'string'
      ? jobData.benefits.split(',').map(s => s.trim()).filter(Boolean)
      : jobData.benefits || [],
    deadline: jobData.deadline ? new Date(jobData.deadline).toISOString() : null,
  };
  return await apiCall('/jobs', { method: 'POST', body: JSON.stringify(payload) });
};

export const updateJob = async (id, jobData) => {
  const payload = {
    ...jobData,
    type: jobData.type?.toUpperCase().replace('-', '_').replace(' ', '_'),
    level: jobData.level?.toUpperCase().replace(' ', '_'),
    category: jobData.category?.toUpperCase(),
    skills: typeof jobData.skills === 'string'
      ? jobData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : jobData.skills || [],
    benefits: typeof jobData.benefits === 'string'
      ? jobData.benefits.split(',').map(s => s.trim()).filter(Boolean)
      : jobData.benefits || [],
    deadline: jobData.deadline ? new Date(jobData.deadline).toISOString() : null,
  };
  return await apiCall(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
};

export const deleteJob = async (id) => {
  return await apiCall(`/jobs/${id}`, { method: 'DELETE' });
};

export const getJobsByCompany = async () => {
  return await apiCall('/company/jobs');
};

export const getDashboardStats = async () => {
  return await apiCall('/company/dashboard');
};

// ===== APPLICATIONS =====
export const applyToJob = async (jobId, applicationData) => {
  return await apiCall(`/applications/jobs/${jobId}`, {
    method: 'POST',
    body: JSON.stringify(applicationData),
  });
};

export const getApplicationsByApplicant = async () => {
  return await apiCall('/applications/my');
};

export const getApplicationsForJob = async (jobId) => {
  return await apiCall(`/company/jobs/${jobId}/applications`);
};

export const updateApplicationStatus = async (applicationId, status, notes = null) => {
  return await apiCall(`/company/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: status.toUpperCase(), notes }),
  });
};

export const hasApplied = async (jobId) => {
  try {
    const data = await apiCall(`/applications/jobs/${jobId}/check`);
    return data.applied;
  } catch { return false; }
};

export const seedJobs = () => {};

// ===== ENUMS for UI =====
export const JOB_TYPES_LIST = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
export const JOB_LEVELS_LIST = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'];
export const JOB_CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Data', 'Product', 'Sales', 'Operations', 'HR', 'Finance', 'Other'];
