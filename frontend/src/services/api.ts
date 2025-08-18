import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and reload the page
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  getNonce: (wallet: string) => api.post('/api/v1/auth/nonce', { wallet }),
  verifySignature: (data: { wallet: string; message: string; signature: string }) =>
    api.post('/api/v1/auth/verify', data),
};

// Users API
export const usersApi = {
  getCurrentUser: () => api.get('/api/v1/users/me'),
  updateCurrentUser: (data: { name?: string; email?: string }) =>
    api.put('/api/v1/users/me', data),
  getAllUsers: () => api.get('/api/v1/users'),
  getUserById: (id: number) => api.get(`/api/v1/users/${id}`),
  updateUserRole: (id: number, role: string) =>
    api.put(`/api/v1/users/${id}/role`, { role }),
  updateUserKyc: (id: number, kyc_status: string) =>
    api.put(`/api/v1/users/${id}/kyc`, { kyc_status }),
};

// Sectors API
export const sectorsApi = {
  getAllSectors: () => api.get('/api/v1/sectors'),
  createSector: (data: { name: string; description: string }) =>
    api.post('/api/v1/sectors', data),
  getSectorById: (id: number) => api.get(`/api/v1/sectors/${id}`),
  updateSector: (id: number, data: { name?: string; description?: string }) =>
    api.put(`/api/v1/sectors/${id}`, data),
  deleteSector: (id: number) => api.delete(`/api/v1/sectors/${id}`),
};

// Contributions API
export const contributionsApi = {
  getAllContributions: (params?: { status?: string; sector_id?: number; user_id?: number }) =>
    api.get('/api/v1/contributions', { params }),
  createContribution: (data: FormData) =>
    api.post('/api/v1/contributions', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getContributionById: (id: number) => api.get(`/api/v1/contributions/${id}`),
  updateContribution: (id: number, data: FormData) =>
    api.put(`/api/v1/contributions/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteContribution: (id: number) => api.delete(`/api/v1/contributions/${id}`),
};

// Verification API
export const verificationApi = {
  getPendingContributions: () => api.get('/api/v1/verify/pending'),
  approveContribution: (id: number, data: { feedback?: string }) =>
    api.post(`/api/v1/verify/${id}/approve`, data),
  rejectContribution: (id: number, data: { feedback: string }) =>
    api.post(`/api/v1/verify/${id}/reject`, data),
};

// Impact API
export const impactApi = {
  getAllImpacts: (params?: { contribution_id?: number }) =>
    api.get('/api/v1/impact', { params }),
  createImpact: (data: FormData) =>
    api.post('/api/v1/impact', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getImpactById: (id: number) => api.get(`/api/v1/impact/${id}`),
  verifyImpact: (id: number, data: { feedback?: string }) =>
    api.post(`/api/v1/impact/${id}/verify`, data),
};

// Marketplace API
export const marketplaceApi = {
  getAllItems: (params?: { active?: boolean }) =>
    api.get('/api/v1/marketplace', { params }),
  createItem: (data: { name: string; description: string; price: number; image_url?: string; active?: boolean }) =>
    api.post('/api/v1/marketplace', data),
  getItemById: (id: number) => api.get(`/api/v1/marketplace/${id}`),
  updateItem: (id: number, data: { name?: string; description?: string; price?: number; image_url?: string; active?: boolean }) =>
    api.put(`/api/v1/marketplace/${id}`, data),
  deleteItem: (id: number) => api.delete(`/api/v1/marketplace/${id}`),
  purchaseItem: (id: number) => api.post(`/api/v1/marketplace/${id}/purchase`),
  getUserPurchases: () => api.get('/api/v1/marketplace/purchases'),
  getPurchaseById: (id: number) => api.get(`/api/v1/marketplace/purchases/${id}`),
};