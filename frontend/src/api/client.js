import { toast } from 'react-hot-toast';
import { getGlobalToastsEnabled } from '../context/ToastContext';

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Althea's Aquatic Farm API Client
 * Handles CSRF tokens, JSON parsing, error handling, and request timeouts.
 */

let csrfToken = '';

/**
 * Fetches and stores the CSRF token from the backend.
 */
export async function initCsrf() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch('/api/csrf-token', { credentials: 'include', signal: controller.signal });
    const data = await response.json();
    if (data.token) {
      csrfToken = data.token;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('CSRF token request timed out');
    } else {
      console.error('Failed to initialize CSRF token:', error);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Base fetch wrapper for Althea's Aquatic API.
 */
export async function apiFetch(path, options = {}) {
  const { 
    method = 'GET', 
    body, 
    headers = {}, 
    showToast = null,
    timeout = DEFAULT_TIMEOUT_MS,
    ...rest 
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const defaultHeaders = {
    ...headers,
  };

  if (method !== 'GET' && csrfToken) {
    defaultHeaders['X-CSRF-Token'] = csrfToken;
  }

  if (body && !(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers: defaultHeaders,
    credentials: 'include',
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    signal: controller.signal,
    ...rest,
  };

  let response;
  try {
    response = await fetch(path, config);
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      const message = 'Request timed out. Please check your connection and try again.';
      if (showToast !== false && getGlobalToastsEnabled()) {
        toast.error(message);
      }
      throw new Error(message);
    }
    throw fetchError;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: 'An unexpected error occurred' };
    }
    
    const message = errorData.error || response.statusText;
    if (showToast === true || (showToast !== false && getGlobalToastsEnabled())) {
      toast.error(message);
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    if (showToast === true || (showToast === null && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method))) {
      toast.success('Successfully updated');
    }
    return null;
  }

  const result = await response.json();

  if (showToast === true || (showToast === null && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method))) {
    if (getGlobalToastsEnabled() || showToast === true) {
      const successMsg = result.message || 'Operation successful';
      toast.success(successMsg);
    }
  }

  return result;
}
