@echo off
REM MedLink Deployment Helper Script for Windows
REM This script helps setup MedLink for deployment to Railway and Vercel

echo.
echo ===================================
echo MedLink Deployment Setup
echo ===================================
echo.

REM Check if running from root directory
if not exist "DEPLOYMENT.md" (
    echo Error: Please run this script from the MedLink root directory
    pause
    exit /b 1
)

echo Starting MedLink Deployment Setup...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

echo [OK] Node.js installed
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo      Node version: %NODE_VERSION%
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed.
    pause
    exit /b 1
)

echo [OK] npm installed
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..
echo.

REM Check environment files
echo Checking environment configuration...
echo.

if not exist "backend\.env" (
    echo Creating backend\.env file...
    (
        echo MONGODB_URI=mongodb+srv://Med:Tham@9787@cluster0.bdrbhwe.mongodb.net/med_link?retryWrites=true^&w=majority
        echo PORT=5000
        echo NODE_ENV=production
        echo JWT_SECRET=med_link_secure_key_2024
        echo CORS_ORIGIN=*
    ) > backend\.env
    echo [OK] backend\.env created
) else (
    echo [OK] backend\.env already exists
)
echo.

if not exist "frontend\.env" (
    echo Creating frontend\.env file...
    (
        echo VITE_API_URL=http://localhost:5000
        echo VITE_APP_NAME=VoiceTriage AI System
    ) > frontend\.env
    echo [OK] frontend\.env created
) else (
    echo [OK] frontend\.env already exists
)
echo.

REM Summary
echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo Next steps:
echo.
echo 1. Local Development:
echo    Backend:  cd backend ^&^& npm start
echo    Frontend: cd frontend ^&^& npm run dev
echo.
echo 2. Deploy to Railway (Backend):
echo    npm install -g @railway/cli
echo    railway login
echo    cd backend ^&^& railway init
echo    railway variables set MONGODB_URI='...'
echo    railway up
echo.
echo 3. Deploy to Vercel (Frontend):
echo    npm install -g vercel
echo    cd frontend ^&^& vercel
echo    Update VITE_API_URL to your Railway URL
echo    vercel --prod
echo.
echo 4. Read the documentation:
echo    - DEPLOYMENT.md - Complete deployment guide
echo    - MONGODB_MIGRATION.md - MongoDB technical details
echo    - QUICKSTART.md - Quick start instructions
echo.
echo MongoDB Credentials:
echo   Host: cluster0.bdrbhwe.mongodb.net
echo   User: Med
echo   Password: Tham@9787
echo.
echo Good luck with your deployment!
echo.
pause
