import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

import { authApi, usersApi } from '../services/api';
import { User, UserRole, KycStatus } from '../types';
import { ApiError } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          await refreshUser();
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        logout();
      }
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const userData = await usersApi.getCurrentUser();
      setState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: apiError.message || 'Failed to fetch user data',
      });
      throw error;
    }
  };

  const login = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      
      // Get the nonce from the server
      const { nonce } = await authApi.getNonce(address);
      
      // Create SIWE message
      const domain = window.location.host;
      const origin = window.location.origin;
      
      const message = new SiweMessage({
        domain,
        address,
        statement: 'Sign in with Ethereum to ContriBlock',
        uri: origin,
        version: '1',
        chainId: 1,
        nonce,
      });
      
      const messageToSign = message.prepareMessage();
      
      // Sign the message
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageToSign);
      
      // Verify the signature on the server
      const authResponse = await authApi.verifySignature({
        wallet: address,
        message: messageToSign,
        signature,
      });
      
      // Save the token
      const { access_token, ...userData } = authResponse;
      localStorage.setItem('accessToken', access_token);
      
      // Update state
      setState({
        user: userData as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message || 'Login failed. Please try again.',
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Add Ethereum window type with proper typing
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
      chainId?: string;
    };
  }
}