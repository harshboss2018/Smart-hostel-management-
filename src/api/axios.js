import axios from 'axios';
import { demoRequest } from './demoBackend';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

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
