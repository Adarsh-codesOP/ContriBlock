import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import axios from 'axios';

import { api } from '../services/api';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await refreshUser();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/v1/users/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      
      // Get the nonce from the server
      const nonceResponse = await api.post('/api/v1/auth/nonce', { wallet: address });
      const nonce = nonceResponse.data.nonce;
      
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
      const authResponse = await api.post('/api/v1/auth/verify', {
        wallet: address,
        message: messageToSign,
        signature,
      });
      
      // Save the token and set the user
      const { access_token, ...userData } = authResponse.data;
      localStorage.setItem('accessToken', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Add Ethereum window type
declare global {
  interface Window {
    ethereum?: any;
  }
}