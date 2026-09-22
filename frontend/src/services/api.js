import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function fetchWithAuth(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network errors (e.g., TypeError: Failed to fetch)
    const error = new Error('Network failure. Please check your connection.');
    error.status = 0;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  if (response.status === 401) {
    await supabase.auth.signOut();
    const error = new Error('Your session has expired. Please log in again.');
    error.status = 401;
    throw error;
  }

  // For 403, 404, 409 — parse body first so we can surface backend-specific messages
  if (response.status === 403 || response.status === 404 || response.status === 409) {
    const body = await response.json().catch(() => null);
    const defaults = {
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'This record already exists.'
    };
    const error = new Error(body?.error || defaults[response.status]);
    error.status = response.status;
    error.data = body;
    throw error;
  }

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMessage = responseData?.error || 'An unexpected error occurred.';
    
    // Sanitize backend errors if they slip through
    if (errorMessage.includes('duplicate key value') || errorMessage.includes('violates unique constraint')) {
      errorMessage = 'This record already exists.';
    } else if (response.status >= 500) {
      errorMessage = 'The server encountered an unexpected condition. Please try again later.';
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return responseData;
}

export const api = {
  get: (endpoint, options) => fetchWithAuth(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => fetchWithAuth(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  patch: (endpoint, data, options) => fetchWithAuth(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint, options) => fetchWithAuth(endpoint, { ...options, method: 'DELETE' }),
};
