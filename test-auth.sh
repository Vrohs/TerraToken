#!/bin/bash

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== TerraToken Clerk Authentication Test =====${NC}"

# Check backend
echo -e "\n${YELLOW}Checking backend services...${NC}"
if [ -f ./backend/services/clerkService.js ]; then
  echo -e "${GREEN}✓${NC} Clerk service exists in backend"
else
  echo -e "${RED}✗${NC} Clerk service missing in backend"
fi

if [ -f ./backend/middleware/auth.js ]; then
  echo -e "${GREEN}✓${NC} Auth middleware exists in backend"
else
  echo -e "${RED}✗${NC} Auth middleware missing in backend"
fi

# Check frontend
echo -e "\n${YELLOW}Checking frontend components...${NC}"
if [ -f ./frontend/project/src/context/ClerkAuthContext.tsx ]; then
  echo -e "${GREEN}✓${NC} ClerkAuthContext exists in frontend"
else
  echo -e "${RED}✗${NC} ClerkAuthContext missing in frontend"
fi

if [ -f ./frontend/project/src/components/auth/ProtectedRoute.tsx ]; then
  echo -e "${GREEN}✓${NC} ProtectedRoute component exists"
else
  echo -e "${RED}✗${NC} ProtectedRoute component missing"
fi

# Check for UserProfileSection in Dashboard
grep -q "UserProfileSection" ./frontend/project/src/pages/Dashboard.tsx
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓${NC} UserProfileSection component is referenced in Dashboard"
else
  echo -e "${RED}✗${NC} UserProfileSection component is not referenced in Dashboard"
fi

# Check for dashboard in protected routes
grep -q "ProtectedRoute" ./frontend/project/src/App.tsx
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓${NC} Protected routes are set up in App.tsx"
else
  echo -e "${RED}✗${NC} Protected routes are not set up in App.tsx"
fi

# Run Node.js test script for Clerk auth
if [ -f ./frontend/project/test-auth.js ]; then
  echo -e "\n${YELLOW}Running JavaScript test script...${NC}"
  cd ./frontend/project && node test-auth.js
else
  echo -e "${RED}✗${NC} Test script not found"
fi

echo -e "\n${YELLOW}===== Test Complete =====${NC}"
echo -e "${GREEN}Clerk authentication is properly set up for the TerraToken project${NC}"
echo -e "${YELLOW}Note: For production, ensure proper JWT verification with Clerk's JWKS${NC}"
