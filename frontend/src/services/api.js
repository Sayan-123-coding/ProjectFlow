import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  if (response.status === 401) {
    await supabase.auth.signOut();
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(responseData?.error || 'API Request Failed');
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
