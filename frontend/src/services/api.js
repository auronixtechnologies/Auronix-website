/**
 * API Client Service
 * Centralized HTTP client for all API requests
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Generic fetch wrapper with error handling
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// ===== Team Members API =====
export const teamAPI = {
  // Get all team members with pagination
  getTeamMembers: (skip = 0, limit = 10) =>
    apiRequest(`/team?skip=${skip}&limit=${limit}`),

  // Get specific team member
  getTeamMember: (id) =>
    apiRequest(`/team/${id}`),

  // Create team member (admin)
  createTeamMember: (data) =>
    apiRequest('/team', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update team member (admin)
  updateTeamMember: (id, data) =>
    apiRequest(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete team member (admin)
  deleteTeamMember: (id) =>
    apiRequest(`/team/${id}`, {
      method: 'DELETE',
    }),
};

// ===== Projects API =====
export const projectsAPI = {
  // Get all projects with optional domain filter
  getProjects: (domain = null, skip = 0, limit = 10) => {
    let endpoint = `/projects?skip=${skip}&limit=${limit}`;
    if (domain) {
      endpoint += `&domain=${domain}`;
    }
    return apiRequest(endpoint);
  },

  // Get featured projects
  getFeaturedProjects: () =>
    apiRequest('/projects/featured'),

  // Get specific project
  getProject: (id) =>
    apiRequest(`/projects/${id}`),

  // Create project (admin)
  createProject: (data) =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update project (admin)
  updateProject: (id, data) =>
    apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete project (admin)
  deleteProject: (id) =>
    apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    }),
};

// ===== Client Projects API =====
export const clientProjectsAPI = {
  // Get all client projects
  getClientProjects: (skip = 0, limit = 10) =>
    apiRequest(`/client-projects?skip=${skip}&limit=${limit}`),

  // Get specific client project
  getClientProject: (id) =>
    apiRequest(`/client-projects/${id}`),

  // Create client project (admin)
  createClientProject: (data) =>
    apiRequest('/client-projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update client project (admin)
  updateClientProject: (id, data) =>
    apiRequest(`/client-projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete client project (admin)
  deleteClientProject: (id) =>
    apiRequest(`/client-projects/${id}`, {
      method: 'DELETE',
    }),
};

// ===== Contact/Leads API =====
export const contactAPI = {
  // Submit contact form
  submitContact: (data) =>
    apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get all leads (admin)
  getLeads: (skip = 0, limit = 50) =>
    apiRequest(`/admin/leads?skip=${skip}&limit=${limit}`),

  // Get specific lead (admin)
  getLead: (id) =>
    apiRequest(`/admin/leads/${id}`),

  // Delete lead (admin)
  deleteLead: (id) =>
    apiRequest(`/admin/leads/${id}`, {
      method: 'DELETE',
    }),
};

// ===== Blog API =====
export const blogAPI = {
  // Get all published blog posts
  getBlogPosts: (skip = 0, limit = 10) =>
    apiRequest(`/blog?skip=${skip}&limit=${limit}`),

  // Get specific blog post by slug
  getBlogPost: (slug) =>
    apiRequest(`/blog/${slug}`),

  // Create blog post (admin)
  createBlogPost: (data) =>
    apiRequest('/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update blog post (admin)
  updateBlogPost: (id, data) =>
    apiRequest(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete blog post (admin)
  deleteBlogPost: (id) =>
    apiRequest(`/blog/${id}`, {
      method: 'DELETE',
    }),
};

export default {
  teamAPI,
  projectsAPI,
  clientProjectsAPI,
  contactAPI,
  blogAPI,
};
