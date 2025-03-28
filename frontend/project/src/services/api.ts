import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  getNonce: (walletAddress: string) => api.get(`/auth/nonce/${walletAddress}`),
  verifyWallet: (data: any) => api.post('/auth/verify-wallet', data),
  getProfile: () => api.get('/auth/me'),
};

// Projects API
export const projectsAPI = {
  getProjects: (filters?: any) => api.get('/projects', { params: filters }),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (projectData: any) => api.post('/projects', projectData),
  updateProject: (id: string, projectData: any) => api.put(`/projects/${id}`, projectData),
  uploadDocument: (id: string, formData: FormData) => 
    api.post(`/projects/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  submitForVerification: (id: string) => api.post(`/projects/${id}/submit`),
  registerOnBlockchain: (id: string) => api.post(`/projects/${id}/register`),
};

// Carbon Credits API
export const carbonCreditsAPI = {
  getUserCredits: () => api.get('/carbon-credits/user/credits'),
  getCreditDetails: (tokenId: number) => api.get(`/carbon-credits/${tokenId}`),
  mintCarbonCredits: (data: any) => api.post('/carbon-credits/mint', data),
  retireCredits: (data: any) => api.post('/carbon-credits/retire', data),
};

// Marketplace API
export const marketplaceAPI = {
  getListings: (filters?: any) => api.get('/marketplace/listings', { params: filters }),
  listCredit: (data: any) => api.post('/marketplace/list', data),
  buyCredit: (data: any) => api.post('/marketplace/buy', data),
  cancelListing: (data: any) => api.post('/marketplace/cancel', data),
};

// Analytics API
export const analyticsAPI = {
  getMarketOverview: () => api.get('/analytics/market'),
  getCarbonImpact: () => api.get('/analytics/impact'),
  getUserAnalytics: () => api.get('/analytics/users'),
  getProjectMetrics: () => api.get('/analytics/projects'),
};

// Registry Integration API
export const registryAPI = {
  verifyWithRegistry: (registryName: string, data: any) => 
    api.post(`/registry/verify/${registryName}`, data),
  getProjectFromRegistry: (registryName: string, registryProjectId: string) => 
    api.get(`/registry/${registryName}/project/${registryProjectId}`),
  importProject: (registryName: string, data: any) => 
    api.post(`/registry/import/${registryName}`, data),
  searchRegistry: (registryName: string, params: any) => 
    api.get(`/registry/${registryName}/search`, { params }),
};

// IPFS API
export const ipfsAPI = {
  uploadFile: (formData: FormData) => 
    api.post('/ipfs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadJSON: (data: any) => api.post('/ipfs/upload-json', { jsonData: data }),
};

export default api;