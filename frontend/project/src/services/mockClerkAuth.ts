// This file provides mock implementations for Clerk in the demo
import { authAPI } from '../services/api';
import axios, { AxiosResponse } from 'axios';

// Helper to create a mock Axios response
const createAxiosResponse = <T>(data: T): AxiosResponse<T> => {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  };
};

// Override the syncClerkUser method with a mock implementation
// We're completely overriding, not using the original
authAPI.syncClerkUser = async (userData) => {
  try {
    // For demo, create a mock response instead of calling the real API
    const responseData = {
      success: true,
      data: {
        id: 'user_' + Date.now(),
        name: userData.name || 'Demo User',
        email: userData.email || 'demo@example.com',
        walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
        role: 'user',
        imageUrl: userData.imageUrl,
        firstName: userData.name?.split(' ')[0] || 'Demo',
        lastName: userData.name?.split(' ')[1] || 'User',
        createdAt: new Date().toISOString()
      },
      token: 'mock_jwt_token_' + Date.now()
    };
    
    // Store the user in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(responseData.data));
    localStorage.setItem('token', responseData.token);
    
    console.log('Mock Clerk sync response:', responseData);
    return createAxiosResponse(responseData);
  } catch (error) {
    console.error('Error in mock syncClerkUser:', error);
    throw error;
  }
};

// Override the getProfile method with a mock implementation
authAPI.getProfile = async () => {
  // Check if we have a user in localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    return createAxiosResponse({
      success: true,
      data: JSON.parse(storedUser)
    });
  }
  
  // Create a mock user if none exists
  const mockUser = {
    id: 'user_' + Date.now(),
    name: 'Demo User',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@terratoken.com',
    walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
    role: 'user',
    imageUrl: null,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  return createAxiosResponse({
    success: true,
    data: mockUser
  });
};

// Initialize the mocks
const setupMocks = () => {
  console.log('Clerk auth mocks are set up for demo');
  // Pre-initialize a user if needed
  if (!localStorage.getItem('user')) {
    authAPI.getProfile().catch(console.error);
  }
};

// Auto-initialize
setupMocks();

export default {
  setupMocks
};
