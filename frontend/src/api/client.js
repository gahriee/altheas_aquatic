/**
 * Althea's Aquatic API Client
 * Handles CSRF tokens, JSON parsing, and error handling.
 */

let csrfToken = '';

/**
 * Fetches and stores the CSRF token from the backend.
 */
export async function initCsrf() {
  try {
    const response = await fetch('/api/csrf-token', { credentials: 'include' });
    const data = await response.json();
    if (data.token) {
      csrfToken = data.token;
    }
  } catch (error) {
    console.error('Failed to initialize CSRF token:', error);
  }
}

/**
 * Base fetch wrapper for Althea's Aquatic API.
 */
export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;

  const defaultHeaders = {
    ...headers,
  };

  // Inject CSRF token for state-changing requests
  if (method !== 'GET' && csrfToken) {
    defaultHeaders['X-CSRF-Token'] = csrfToken;
  }

  // Set Content-Type to application/json unless body is FormData
  if (body && !(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers: defaultHeaders,
    credentials: 'include',
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    ...rest,
  };

  const response = await fetch(path, config);

  // Handle non-OK responses
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: 'An unexpected error occurred' };
    }
    throw new Error(errorData.error || response.statusText);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}
