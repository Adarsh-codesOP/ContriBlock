import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { User, Contribution, Impact, MarketplaceItem, Purchase, Sector } from '../types';

// Define response types for better type safety
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Define error types
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Create a class for API client with better error handling
class ApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
          // Clear local storage
          localStorage.removeItem('accessToken');
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }
  
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        message: error.response.data.detail || 'An error occurred with the server response',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        message: 'No response received from server. Please check your connection.',
        status: 0
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
  
  // Generic request methods with proper typing
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

// Create API client instance
const apiClient = new ApiClient(import.meta.env.VITE_API_URL || '');

// Auth API with proper typing
export const authApi = {
  getNonce: (wallet: string) => 
    apiClient.post<{ nonce: string }>('/api/v1/auth/nonce', { wallet }),
  verifySignature: (data: { wallet: string; message: string; signature: string }) =>
    apiClient.post<{ access_token: string } & User>('/api/v1/auth/verify', data),
};

// Users API with proper typing
export const usersApi = {
  getCurrentUser: () => 
    apiClient.get<User>('/api/v1/users/me'),
  updateCurrentUser: (data: { name?: string; email?: string }) =>
    apiClient.put<User>('/api/v1/users/me', data),
  getAllUsers: () => 
    apiClient.get<User[]>('/api/v1/users'),
  getUserById: (id: number) => 
    apiClient.get<User>(`/api/v1/users/${id}`),
  updateUserRole: (id: number, role: string) =>
    apiClient.put<User>(`/api/v1/users/${id}/role`, { role }),
  updateUserKyc: (id: number, kycStatus: string) =>
    apiClient.put<User>(`/api/v1/users/${id}/kyc`, { kyc_status: kycStatus }),
};

// Sectors API with proper typing
export const sectorsApi = {
  getAllSectors: () => 
    apiClient.get<Sector[]>('/api/v1/sectors'),
  createSector: (data: { name: string; description: string }) =>
    apiClient.post<Sector>('/api/v1/sectors', data),
  getSectorById: (id: number) => 
    apiClient.get<Sector>(`/api/v1/sectors/${id}`),
  updateSector: (id: number, data: { name?: string; description?: string }) =>
    apiClient.put<Sector>(`/api/v1/sectors/${id}`, data),
  deleteSector: (id: number) => 
    apiClient.delete<{ success: boolean }>(`/api/v1/sectors/${id}`),
};

// Contributions API with proper typing
export const contributionsApi = {
  getAllContributions: (params?: { status?: string; sector_id?: number; user_id?: number }) =>
    apiClient.get<Contribution[]>('/api/v1/contributions', { params }),
  getUserContributions: () =>
    apiClient.get<Contribution[]>('/api/v1/contributions/me'),
  createContribution: (data: FormData) =>
    apiClient.post<Contribution>('/api/v1/contributions', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getContributionById: (id: number) => 
    apiClient.get<Contribution>(`/api/v1/contributions/${id}`),
  updateContribution: (id: number, data: FormData) =>
    apiClient.put<Contribution>(`/api/v1/contributions/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteContribution: (id: number) => 
    apiClient.delete<{ success: boolean }>(`/api/v1/contributions/${id}`),
};

// Verification API with proper typing
export const verificationApi = {
  getPendingContributions: () => 
    apiClient.get<Contribution[]>('/api/v1/verify/pending'),
  approveContribution: (id: number, data: { feedback?: string }) =>
    apiClient.post<Contribution>(`/api/v1/verify/${id}/approve`, data),
  rejectContribution: (id: number, data: { feedback: string }) =>
    apiClient.post<Contribution>(`/api/v1/verify/${id}/reject`, data),
};

// Impact API with proper typing
export const impactApi = {
  getAllImpacts: (params?: { contribution_id?: number }) =>
    apiClient.get<Impact[]>('/api/v1/impact', { params }),
  getUserImpact: () =>
    apiClient.get<Impact[]>('/api/v1/impact/me'),
  createImpact: (data: FormData) =>
    apiClient.post<Impact>('/api/v1/impact', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getImpactById: (id: number) => 
    apiClient.get<Impact>(`/api/v1/impact/${id}`),
  verifyImpact: (id: number, data: { feedback?: string }) =>
    apiClient.post<Impact>(`/api/v1/impact/${id}/verify`, data),
};

// Marketplace API with proper typing
export const marketplaceApi = {
  getAllItems: (params?: { active?: boolean }) =>
    apiClient.get<MarketplaceItem[]>('/api/v1/marketplace', { params }),
  createItem: (data: { name: string; description: string; price: number; image_url?: string; active?: boolean }) =>
    apiClient.post<MarketplaceItem>('/api/v1/marketplace', data),
  getItemById: (id: number) => 
    apiClient.get<MarketplaceItem>(`/api/v1/marketplace/${id}`),
  updateItem: (id: number, data: { name?: string; description?: string; price?: number; image_url?: string; active?: boolean }) =>
    apiClient.put<MarketplaceItem>(`/api/v1/marketplace/${id}`, data),
  deleteItem: (id: number) => 
    apiClient.delete<{ success: boolean }>(`/api/v1/marketplace/${id}`),
  purchaseItem: (id: number) => 
    apiClient.post<Purchase>(`/api/v1/marketplace/${id}/purchase`),
  getUserPurchases: () => 
    apiClient.get<Purchase[]>('/api/v1/marketplace/purchases'),
  getPurchaseById: (id: number) => 
    apiClient.get<Purchase>(`/api/v1/marketplace/purchases/${id}`),
};

// Export the API client for direct use when needed
export { apiClient };

// Export a combined api object for backward compatibility
export const api = {
  auth: authApi,
  users: usersApi,
  sectors: sectorsApi,
  contributions: contributionsApi,
  verification: verificationApi,
  impact: impactApi,
  marketplace: marketplaceApi
};