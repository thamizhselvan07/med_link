#!/bin/bash

# MedLink Deployment Helper Script
# This script helps setup and deploy MedLink to Railway and Vercel

set -e

echo "==================================="
echo "MedLink Deployment Setup"
echo "==================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from root directory
if [ ! -f "DEPLOYMENT.md" ]; then
    echo -e "${RED}Error: Please run this script from the MedLink root directory${NC}"
    exit 1
fi

echo -e "${GREEN}Starting MedLink Deployment Setup...${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if ! command_exists node; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed${NC}"

if ! command_exists npm; then
    echo -e "${RED}npm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed${NC}"

NODE_VERSION=$(node -v)
echo -e "  Node version: $NODE_VERSION"
echo ""

# Install dependencies
echo "Installing backend dependencies..."
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..
echo ""

echo "Installing frontend dependencies..."
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..
echo ""

# Check environment files
echo "Checking environment configuration..."
echo ""

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env file...${NC}"
    cat > backend/.env << EOF
MONGODB_URI=mongodb+srv://Med:Tham@9787@cluster0.bdrbhwe.mongodb.net/med_link?retryWrites=true&w=majority
PORT=5000
NODE_ENV=production
JWT_SECRET=med_link_secure_key_2024
CORS_ORIGIN=*
EOF
    echo -e "${GREEN}✓ backend/.env created${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi
echo ""

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating frontend/.env file...${NC}"
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=VoiceTriage AI System
EOF
    echo -e "${GREEN}✓ frontend/.env created${NC}"
else
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
fi
echo ""

# Summary
echo "==================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "==================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Local Development:"
echo "   Backend:  cd backend && npm start"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "2. Deploy to Railway (Backend):"
echo "   npm install -g @railway/cli"
echo "   railway login"
echo "   cd backend && railway init"
echo "   railway variables set MONGODB_URI='...' "
echo "   railway up"
echo ""
echo "3. Deploy to Vercel (Frontend):"
echo "   npm install -g vercel"
echo "   cd frontend && vercel"
echo "   Update VITE_API_URL to your Railway URL"
echo "   vercel --prod"
echo ""
echo "4. Read the documentation:"
echo "   - DEPLOYMENT.md - Complete deployment guide"
echo "   - MONGODB_MIGRATION.md - MongoDB technical details"
echo "   - QUICKSTART.md - Quick start instructions"
echo ""
echo "MongoDB Credentials:"
echo "  Host: cluster0.bdrbhwe.mongodb.net"
echo "  User: Med"
echo "  Password: Tham@9787"
echo ""
echo -e "${GREEN}Good luck with your deployment! 🚀${NC}"
