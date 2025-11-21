'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User type
export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Make password optional since we don't want to store it in the context
  role: 'user' | 'admin';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
};

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateUserProfile: (updatedUser: User) => Promise<boolean>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Function to get the correct backend URL based on device
const getBackendUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000'; // Default for server-side
  }
  
  // Check if we're on a mobile device or external network
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    return 'http://localhost:5000'; // Your laptop 
  } else {
    // For mobile devices, use your computer's IP address
   //return 'http://192.168.73.38:5000'; 
   return 'http://192.168.100.77:5000'; // ← YOUR COMPUTER'S IP
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
  try {
    setIsLoading(true);
    setError(null);

    const backendUrl = getBackendUrl();
    console.log('Connecting to backend:', backendUrl);

    const response = await fetch(`${backendUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      }),
    });

    if (response.ok) {
      const result = await response.json();
      
      const userData = {
        id: result.user.id.toString(),
        name: result.user.username,
        email: result.user.email,
        role: result.user.role as 'user' | 'admin',
        createdAt: new Date(result.user.created_at),
        updatedAt: new Date()
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // DON'T redirect here - let the components handle redirects
      return true;
    } else {
      const errorData = await response.json();
      setError(errorData.error || 'Login failed');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('Network error - could not connect to server. Make sure Flask is running and accessible from your network.');
    return false;
  } finally {
    setIsLoading(false);
  }
};

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
  try {
    setIsLoading(true);
    setError(null);

    const backendUrl = getBackendUrl();
    console.log('Connecting to backend for registration:', backendUrl);

    const response = await fetch(`${backendUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: name,  // Your backend expects "username"
        email: email,
        password: password
      }),
    });

    if (response.ok) {
      const result = await response.json();
      
      // Set user data from backend response
      const userData = {
        id: result.user.id.toString(),
        name: result.user.username,  // Use username as name
        email: result.user.email,
        role: result.user.role as 'user' | 'admin',
        createdAt: new Date(result.user.created_at),
        updatedAt: new Date()
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } else {
      const errorData = await response.json();
      setError(errorData.error || 'Registration failed');
      return false;
    }
  } catch (error) {
    console.error('Registration error:', error);
    setError('Network error - could not connect to server. Make sure: 1) Flask is running, 2) Both devices are on same WiFi, 3) Firewall allows connections');
    return false;
  } finally {
    setIsLoading(false);
  }
};

  const updateUserProfile = async (updatedUser: User): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In a real app, we would make an API call to update the user profile
      // For now, we'll just update our state
      setUser(updatedUser);
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        isAuthenticated,
        isLoading, 
        error, 
        login, 
        logout, 
        register,
        updateUserProfile,
        setUser,
        clearError
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};