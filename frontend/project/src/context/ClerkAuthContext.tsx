import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { authAPI } from '../services/api';
// Import mock service for demo
import '../services/mockClerkAuth';

interface ClerkAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  syncUserWithBackend: () => Promise<void>;
  getToken: () => Promise<string | null>;
  logout: () => void;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: isClerkLoaded, isSignedIn, getToken, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [backendSynced, setBackendSynced] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Initialize mock service for demo
  useEffect(() => {
    console.log('Initializing mock Clerk auth service for demo');
  }, []);

  // Logout function
  const logout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setBackendSynced(false);
      setUser(null);
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Sync Clerk user with our backend
  const syncUserWithBackend = async () => {
    if (!isClerkLoaded || !isSignedIn || !clerkUser) return;

    try {
      setIsLoading(true);
      
      // Get the JWT from Clerk to send to our backend
      const token = await getToken();
      
      if (token) {
        // Store the token in localStorage for our API interceptor
        localStorage.setItem('token', token);
        
        // Sync the user info with our backend
        const response = await authAPI.syncClerkUser({
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          imageUrl: clerkUser.imageUrl,
        });
        
        if (response.data && response.data.data) {
          setUser(response.data.data);
        }
        
        setBackendSynced(true);
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClerkLoaded) {
      if (isSignedIn && clerkUser) {
        syncUserWithBackend();
      } else {
        // Clear the token when user is not signed in
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoading(false);
      }
    }
  }, [isClerkLoaded, isSignedIn, clerkUser]);

  // Helper for getting token
  const getUserToken = async () => {
    if (!isSignedIn) return null;
    return await getToken();
  };

  return (
    <ClerkAuthContext.Provider
      value={{
        isAuthenticated: isSignedIn || false,
        isLoading,
        user: user || clerkUser,
        syncUserWithBackend,
        getToken: getUserToken,
        logout
      }}
    >
      {children}
    </ClerkAuthContext.Provider>
  );
};

export const useClerkAuth = (): ClerkAuthContextType => {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider');
  }
  return context;
};
