# Clerk Authentication in TerraToken

This document provides an overview of how Clerk authentication is integrated into the TerraToken project.

## Overview

TerraToken uses Clerk for authentication, providing a secure, easy-to-use authentication system for users. The integration supports:

- Email-based authentication via Clerk
- Wallet connection authentication (via MetaMask or similar)
- Protected routes for authenticated users
- User profile management

## Components

### Frontend

1. **ClerkAuthContext** (`/frontend/project/src/context/ClerkAuthContext.tsx`)
   - Provides authentication state and methods throughout the application
   - Syncs Clerk user data with the backend
   - Manages authentication tokens

2. **ProtectedRoute** (`/frontend/project/src/components/auth/ProtectedRoute.tsx`)
   - Protects routes that require authentication
   - Redirects unauthenticated users to the login page

3. **Login Page** (`/frontend/project/src/pages/Login.tsx`)
   - Provides login options with both Clerk (email) and wallet connection
   - Uses Clerk's SignIn component for email authentication

4. **UserProfileSection** (`/frontend/project/src/pages/Dashboard.tsx`)
   - Displays user information from Clerk
   - Shows email and wallet connection status

5. **Navigation** (`/frontend/project/src/components/layout/Navigation.tsx`)
   - Shows login/logout options based on authentication state
   - Displays user information when authenticated

### Backend

1. **Clerk Service** (`/backend/services/clerkService.js`)
   - Verifies Clerk JWT tokens
   - Syncs Clerk users with the application database

2. **Auth Middleware** (`/backend/middleware/auth.js`)
   - Protects API routes, requiring valid authentication
   - Handles both Clerk tokens and wallet-based authentication

3. **Auth Routes** (`/backend/routes/authRoutes.js`)
   - Provides endpoints for authentication operations
   - Handles user registration and login

## Implementation Details

### Authentication Flow

1. **Email Login with Clerk**
   - User authenticates via Clerk's SignIn component
   - On successful authentication, Clerk provides a JWT token
   - The token is stored in localStorage
   - User data is synced with the backend via API

2. **Wallet Connection**
   - User connects their wallet (e.g., MetaMask)
   - Wallet address is used to authenticate the user
   - Backend generates a JWT token for the session

### Protected Routes

Protected routes are wrapped with the `ProtectedRoute` component in `App.tsx`:

```jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### API Authentication

API requests include the authentication token via an Axios interceptor in `api.ts`:

```javascript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## Demo Mode

For demonstration purposes, the project includes mock implementations:

1. **Mock Clerk Auth** (`/frontend/project/src/services/mockClerkAuth.ts`)
   - Provides mock implementations of Clerk authentication
   - Generates demo user data and tokens

2. **Simple JWT Verification** in `clerkService.js`
   - For production, implement proper JWT verification with Clerk's JWKS

## Testing

Run the authentication test script to verify the setup:

```bash
./test-auth.sh
```

## Production Considerations

1. **Environment Variables**
   - Replace the hardcoded Clerk publishable key with an environment variable
   - Set up proper JWKS verification for Clerk tokens

2. **Security**
   - Implement proper session management
   - Add rate limiting to prevent brute force attacks
   - Use HTTPS for all API calls

3. **User Experience**
   - Add email verification
   - Implement proper error handling for authentication failures
   - Add password reset functionality

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [React Router Documentation](https://reactrouter.com/en/main)
- [JWT.io](https://jwt.io/)
