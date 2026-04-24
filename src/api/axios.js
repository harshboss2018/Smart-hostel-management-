import axios from 'axios';
import { demoRequest } from './demoBackend';

const normalizeApiBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl) return rawBaseUrl;
  const trimmed = String(rawBaseUrl).trim().replace(/\/+$/, '');
  if (trimmed === '/api') return trimmed;
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : '');

if (!rawBaseUrl) {
  throw new Error(
    'Missing VITE_API_BASE_URL. Set it to your backend origin (e.g. https://smart-hostel-management-v6a6.onrender.com).',
  );
}

const apiBaseUrl = normalizeApiBaseUrl(rawBaseUrl);

const http = axios.create({
  baseURL: apiBaseUrl,
});

const shouldFallbackToDemo = (error, url) => {
  if (!error.response) {
    return true;
  }

  const status = error.response.status;
  const isLostFoundRoute = url.startsWith('/lost-found');
  const isFeedbackRoute = url.startsWith('/feedback');
  const isServerRouteGap = status === 404 || status >= 500;

  return (isLostFoundRoute || isFeedbackRoute) && isServerRouteGap;
};

const withAuth = (config = {}) => {
  const token = localStorage.getItem('token');
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const callWithFallback = async (method, url, payload, config) => {
  const finalConfig = withAuth(config);

  try {
    if (method === 'get') {
      return await http.get(url, finalConfig);
    }
    if (method === 'post') {
      return await http.post(url, payload, finalConfig);
    }
    if (method === 'patch') {
      return await http.patch(url, payload, finalConfig);
    }
    throw new Error(`Unsupported method: ${method}`);
  } catch (error) {
    if (!shouldFallbackToDemo(error, url)) {
      throw error;
    }

    try {
      return await demoRequest(method, url, payload, finalConfig);
    } catch (demoError) {
      const wrapped = new Error(demoError.message || 'Request failed');
      wrapped.response = { data: { message: demoError.message || 'Request failed' } };
      throw wrapped;
    }
  }
};

const API = {
  get: (url, config) => callWithFallback('get', url, undefined, config),
  post: (url, payload, config) => callWithFallback('post', url, payload, config),
  patch: (url, payload, config) => callWithFallback('patch', url, payload, config),
};

export default API;
