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

// Create API client instance with mock mode
const apiClient = new ApiClient(import.meta.env.VITE_API_URL || '');

// Create a mock API client that returns fake data
class MockApiClient {
  async get<T>(url: string): Promise<T> {
    console.log(`Mock GET request to ${url}`);
    return this.getMockData(url) as T;
  }
  
  async post<T>(url: string, data?: any): Promise<T> {
    console.log(`Mock POST request to ${url}`, data);
    return this.getMockData(url, data) as T;
  }
  
  async put<T>(url: string, data?: any): Promise<T> {
    console.log(`Mock PUT request to ${url}`, data);
    return this.getMockData(url, data) as T;
  }
  
  async delete<T>(url: string): Promise<T> {
    console.log(`Mock DELETE request to ${url}`);
    return { success: true } as T;
  }
  
  private getMockData(url: string, data?: any): any {
    // Mock user data
    const mockUser = {
      id: 999,
      wallet: data?.wallet || '0x0000000000000000000000000000000000000000',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'ADMIN',
      kycStatus: 'APPROVED',
      reputation: 100,
      tokenBalance: 500,
      createdAt: new Date().toISOString()
    };
    
    // Mock sector data
    const mockSectors = [
      { id: 1, name: 'Environmental', description: 'Environmental projects', created_at: new Date().toISOString() },
      { id: 2, name: 'Social', description: 'Social impact projects', created_at: new Date().toISOString() },
      { id: 3, name: 'Educational', description: 'Educational projects', created_at: new Date().toISOString() }
    ];
    
    // Mock contribution data
    const mockContributions = [
      {
        id: 1,
        title: 'Sample Contribution 1',
        description: 'Sample contribution description',
        status: 'APPROVED',
        userId: 999,
        user: mockUser,
        sectorId: 1,
        sector: mockSectors[0],
        evidenceUrl: 'https://example.com/evidence',
        feedback: null,
        blockchainTx: '0xabc...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Sample Contribution 2',
        description: 'Another sample contribution',
        status: 'PENDING',
        userId: 999,
        user: mockUser,
        sectorId: 2,
        sector: mockSectors[1],
        evidenceUrl: 'https://example.com/evidence2',
        feedback: null,
        blockchainTx: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Mock impact data
    const mockImpacts = [
      {
        id: 1,
        title: 'Sample Impact 1',
        description: 'Sample impact description',
        metrics: 'Carbon reduction: 10 tons',
        isVerified: true,
        contributionId: 1,
        contribution: mockContributions[0],
        evidenceUrl: 'https://example.com/impact-evidence',
        feedback: 'Great impact!',
        blockchainTx: '0xdef...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        value: 100
      },
      {
        id: 2,
        title: 'Sample Impact 2',
        description: 'Another sample impact',
        metrics: 'Water saved: 5000 liters',
        isVerified: true,
        contributionId: 2,
        contribution: mockContributions[1],
        evidenceUrl: 'https://example.com/impact-evidence2',
        feedback: 'Excellent work!',
        blockchainTx: '0xabc...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        value: 150
      }
    ];
    
    // Mock marketplace items
    const mockMarketplaceItems = [
      {
        id: 1,
        name: 'Sample Item 1',
        description: 'Sample item description',
        price: 100,
        imageUrl: 'https://example.com/item1.jpg',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Sample Item 2',
        description: 'Another sample item',
        price: 200,
        imageUrl: 'https://example.com/item2.jpg',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Mock purchases
    const mockPurchases = [
      {
        id: 1,
        userId: 999,
        user: mockUser,
        itemId: 1,
        item: mockMarketplaceItems[0],
        status: 'COMPLETED',
        blockchainTx: '0xghi...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Return mock data based on the URL
    if (url.includes('/api/v1/auth/nonce')) {
      return { nonce: 'mock-nonce-123456' };
    } else if (url.includes('/api/v1/auth/verify')) {
      return { access_token: 'mock-token-123456', ...mockUser };
    } else if (url.includes('/api/v1/users/me')) {
      return mockUser;
    } else if (url.includes('/api/v1/users')) {
      return [mockUser];
    } else if (url.includes('/api/v1/sectors')) {
      return mockSectors;
    } else if (url.includes('/api/v1/contributions/me')) {
      return mockContributions.filter(c => c.userId === 999);
    } else if (url.includes('/api/v1/contributions')) {
      return mockContributions;
    } else if (url.includes('/api/v1/verify/pending')) {
      return mockContributions.filter(c => c.status === 'PENDING');
    } else if (url.includes('/api/v1/impact/me')) {
      return mockImpacts.filter(i => i.userId === 999);
    } else if (url.includes('/api/v1/impact')) {
      return mockImpacts;
    } else if (url.includes('/api/v1/marketplace/purchases')) {
      return mockPurchases;
    } else if (url.includes('/api/v1/marketplace')) {
      return mockMarketplaceItems;
    }
    
    // Default fallback
    return {};
  }
}

// Use mock API client instead of real one
const mockApiClient = new MockApiClient();

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
    mockApiClient.get<Sector[]>('/api/v1/sectors'),
  createSector: (data: { name: string; description: string }) =>
    mockApiClient.post<Sector>('/api/v1/sectors', data),
  getSectorById: (id: number) => 
    mockApiClient.get<Sector>(`/api/v1/sectors/${id}`),
  updateSector: (id: number, data: { name?: string; description?: string }) =>
    mockApiClient.put<Sector>(`/api/v1/sectors/${id}`, data),
  deleteSector: (id: number) => 
    mockApiClient.delete<{ success: boolean }>(`/api/v1/sectors/${id}`),
};

// Contributions API with proper typing
export const contributionsApi = {
  getAllContributions: (params?: { status?: string; sector_id?: number; user_id?: number }) =>
    mockApiClient.get<Contribution[]>('/api/v1/contributions'),
  getUserContributions: () =>
    mockApiClient.get<Contribution[]>('/api/v1/contributions/me'),
  createContribution: (data: FormData) =>
    mockApiClient.post<Contribution>('/api/v1/contributions', data),
  getContributionById: (id: number) => 
    mockApiClient.get<Contribution>(`/api/v1/contributions/${id}`),
  updateContribution: (id: number, data: FormData) =>
    mockApiClient.put<Contribution>(`/api/v1/contributions/${id}`, data),
  deleteContribution: (id: number) => 
    mockApiClient.delete<{ success: boolean }>(`/api/v1/contributions/${id}`),
};

// Verification API with proper typing
export const verificationApi = {
  getPendingContributions: () => 
    mockApiClient.get<Contribution[]>('/api/v1/verify/pending'),
  approveContribution: (id: number, data: { feedback?: string }) =>
    mockApiClient.post<Contribution>(`/api/v1/verify/${id}/approve`, data),
  rejectContribution: (id: number, data: { feedback: string }) =>
    mockApiClient.post<Contribution>(`/api/v1/verify/${id}/reject`, data),
};

// Impact API with proper typing
export const impactApi = {
  getAllImpacts: (params?: { contribution_id?: number }) =>
    mockApiClient.get<Impact[]>('/api/v1/impact'),
  getUserImpact: () =>
    mockApiClient.get<Impact[]>('/api/v1/impact/me'),
  createImpact: (data: FormData) =>
    mockApiClient.post<Impact>('/api/v1/impact', data),
  getImpactById: (id: number) => 
    mockApiClient.get<Impact>(`/api/v1/impact/${id}`),
  verifyImpact: (id: number, data: { feedback?: string }) =>
    mockApiClient.post<Impact>(`/api/v1/impact/${id}/verify`, data),
};

// Marketplace API with proper typing
export const marketplaceApi = {
  getAllItems: (params?: { active?: boolean }) =>
    mockApiClient.get<MarketplaceItem[]>('/api/v1/marketplace'),
  createItem: (data: { name: string; description: string; price: number; image_url?: string; active?: boolean }) =>
    mockApiClient.post<MarketplaceItem>('/api/v1/marketplace', data),
  getItemById: (id: number) => 
    mockApiClient.get<MarketplaceItem>(`/api/v1/marketplace/${id}`),
  updateItem: (id: number, data: { name?: string; description?: string; price?: number; image_url?: string; active?: boolean }) =>
    mockApiClient.put<MarketplaceItem>(`/api/v1/marketplace/${id}`, data),
  deleteItem: (id: number) => 
    mockApiClient.delete<{ success: boolean }>(`/api/v1/marketplace/${id}`),
  purchaseItem: (id: number) => 
    mockApiClient.post<Purchase>(`/api/v1/marketplace/${id}/purchase`),
  getUserPurchases: () => 
    mockApiClient.get<Purchase[]>('/api/v1/marketplace/purchases'),
  getPurchaseById: (id: number) => 
    mockApiClient.get<Purchase>(`/api/v1/marketplace/purchases/${id}`),
};

// Export the mock API client for direct use when needed
export { mockApiClient as apiClient };

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