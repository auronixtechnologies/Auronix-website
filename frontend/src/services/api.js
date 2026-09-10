/**
 * Public API client — read-only endpoints plus the contact form.
 *
 * Writes are NOT here. Every mutating endpoint requires a Bearer token and
 * lives in adminApi.js, which attaches it. This file previously carried a
 * duplicate set of create/update/delete methods that sent no Authorization
 * header; nothing called them and every one would have failed with a 401.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Build the URL for a stored image.
 *
 * Images are served as bytes from their own endpoint rather than inlined into
 * list responses as base64, so the browser can cache them. The response is
 * marked immutable, and `v` (the record's updated_at) changes whenever the
 * record is edited, which is what busts that cache.
 *
 *   imageUrl('projects', 12, project.updated_at)
 *
 * Returns null when the record has no image, so callers can render a
 * placeholder with `imageUrl(...) ?? fallback`.
 */
export function imageUrl(resource, id, updatedAt, hasImage = true) {
  if (!hasImage || id == null) return null;
  const version = updatedAt ? `?v=${encodeURIComponent(updatedAt)}` : '';
  return `${API_BASE_URL}/${resource}/${id}/image${version}`;
}

/** Fetch wrapper that unwraps JSON and surfaces the API's error detail. */
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

const query = (params) =>
  Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

// ===== Team Members =====
export const teamAPI = {
  getTeamMembers: (skip = 0, limit = 10) => apiRequest(`/team?${query({ skip, limit })}`),
  getTeamMember: (id) => apiRequest(`/team/${id}`),
};

// ===== Portfolio Projects =====
export const projectsAPI = {
  getProjects: (domain = null, category = null, skip = 0, limit = 100) =>
    apiRequest(`/projects?${query({ skip, limit, domain, category })}`),
  getFeaturedProjects: () => apiRequest('/projects/featured'),
  getProject: (id) => apiRequest(`/projects/${id}`),
};

// ===== Client Projects / Case Studies =====
export const clientProjectsAPI = {
  getClientProjects: (skip = 0, limit = 10) =>
    apiRequest(`/client-projects?${query({ skip, limit })}`),
  getClientProject: (id) => apiRequest(`/client-projects/${id}`),
};

// ===== Contact =====
export const contactAPI = {
  submitContact: (data) =>
    apiRequest('/contact', { method: 'POST', body: JSON.stringify(data) }),
};

// ===== Blog =====
export const blogAPI = {
  getBlogPosts: (skip = 0, limit = 10) => apiRequest(`/blog?${query({ skip, limit })}`),
  getBlogPost: (slug) => apiRequest(`/blog/${slug}`),
};
