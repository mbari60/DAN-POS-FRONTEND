// this is the correct code
"use client";

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getToken, setToken, removeToken } from '@/lib/auth';
import { loginUser, validateToken } from '@/services/auth';
import { authReducer, initialState } from '@/reducers/authReducer';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper functions to manage user data in sessionStorage
const storeUserData = (userData) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('userData', JSON.stringify(userData));
  }
};

const getUserData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data from sessionStorage:', error);
    return null;
  }
};

const removeUserData = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('userData');
  }
};

export const AuthProvider = ({ children }) => {
  // Initialize state with user data from sessionStorage if available
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    user: getUserData(),
    isAuthenticated: !!getToken(),
    token: getToken(),
    isInitialized: false
  });
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      // Only run on client side after component mounts
      if (isClient) {
        try {
          const token = getToken();
          console.log('Token found during init:', !!token);
          
          if (token) {
            dispatch({ type: 'AUTH_INIT' });
            try {
              // Try to validate the token and get fresh user data
              const userData = await validateToken(token);
              storeUserData(userData); // Store in sessionStorage
              dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user: userData } });
            } catch (validationError) {
              console.error('Token validation failed:', validationError);
              // If token validation fails but we have stored user data, use it
              const storedUserData = getUserData();
              if (storedUserData) {
                console.log('Using stored user data after token validation failed');
                dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user: storedUserData } });
              } else {
                removeToken();
                removeUserData();
                dispatch({ type: 'AUTH_READY' });
              }
            }
          } else {
            // No token, clear any stored user data
            removeUserData();
            dispatch({ type: 'AUTH_READY' });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          removeToken();
          removeUserData();
          dispatch({ type: 'AUTH_READY' });
        }
      }
    };

    initAuth();
  }, [isClient]);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const response = await loginUser(credentials);
      
      // Store token in cookie
      setToken(response.token, response.expires);
      // Store user data in sessionStorage
      storeUserData(response.user);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { token: response.token, user: response.user } 
      });
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    removeToken();
    removeUserData();
    dispatch({ type: 'LOGOUT' });
    toast.info('Logged out successfully');
  };

  const value = {
    ...state,
    login,
    logout,
    isAuthenticated: !!state.token,
    hasPermission: (permission) => state.user?.permissions?.includes(permission) || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
