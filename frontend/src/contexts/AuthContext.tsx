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
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'metamask_not_installed'
        }));
        return;
      }
      
      // Check if it's actually MetaMask
      if (!window.ethereum.isMetaMask) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'not_metamask'
        }));
        return;
      }

      // Get the user's Ethereum address
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      
      if (!address) {
        throw new Error('No Ethereum address found. Please check your MetaMask connection.');
      }
      
      // Get a nonce from the server for this wallet address
      const { nonce } = await authApi.getNonce(address);
      
      // Create a SIWE message for the user to sign
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = 'Sign in with Ethereum to ContriBlock';
      
      const message = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: parseInt(window.ethereum.chainId || '1', 16),
        nonce
      });
      
      const messageToSign = message.prepareMessage();
      
      // Request signature from the user
      const signature = await provider.getSigner().signMessage(messageToSign);
      
      // Verify the signature with the backend
      const authResult = await authApi.verifySignature({
        wallet: address,
        message: messageToSign,
        signature
      });
      
      // Store the token and update state
      localStorage.setItem('accessToken', authResult.access_token);
      
      // Update state with authenticated user
      setState({
        user: authResult,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Login error:', error);
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