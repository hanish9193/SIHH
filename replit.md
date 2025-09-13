# Hariyali Mitra - Farm Assistant Application

## Project Overview
Hariyali Mitra is a comprehensive farming assistance application built with React, TypeScript, and Vite. It provides farmers with:
- Plant disease diagnosis through AI-powered image analysis
- Agricultural marketplace for buying/selling produce
- Community features and expert guidance
- Localized content and multi-language support

## Technology Stack
- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Routing**: React Router DOM 6.30.1
- **State Management**: TanStack React Query
- **Mobile**: Capacitor for hybrid app development
- **Styling**: Tailwind CSS with custom animations

## Current Setup
**Status**: ✅ Successfully configured for Replit environment
**Frontend Server**: Running on port 5000 (Vite dev server for development)
**Backend Server**: Running on port 8000 (Flask API server for development)
**Deployment**: ✅ Configured for autoscale deployment with Gunicorn serving static React build
**Production Setup**: Single Flask server serves both API and static files on port 5000
**Last Updated**: September 13, 2025

### Development Configuration
- Vite dev server configured for Replit (host: 0.0.0.0, port: 5000)
- All hosts allowed for proper iframe rendering in Replit
- Hot module replacement enabled for development

### Deployment Configuration
- **Target**: Autoscale (single Flask server with integrated static serving)
- **Build Command**: `npm ci --omit=dev && npm run build && pip install -r requirements.txt`
- **Run Command**: `gunicorn -w 2 -k gthread -b 0.0.0.0:5000 server.plant_diagnosis_api:app`
- **Production Notes**: Flask serves React build from `/sihh/dist` with SPA routing fallback
- **Port**: 5000 (single server for both API and static files)

## Project Structure
```
src/
├── components/     # Reusable UI components (shadcn/ui)
├── pages/         # Application pages/routes
├── hooks/         # Custom React hooks
├── lib/           # Utilities and configurations
└── assets/        # Images and static assets
```

## Key Features Implemented
1. **Landing & Onboarding**: Multi-step user introduction
2. **Authentication**: Login/signup system
3. **Plant Diagnosis**: Camera capture and AI analysis
4. **Marketplace**: Shopping cart and checkout flow
5. **Profile Management**: User profile editing
6. **Community Features**: Guides and treatments

## Development Workflow
- **Frontend Server**: Workflow configured on port 5000
- **Backend Server**: Workflow configured on port 8000 (Python Flask API)
- **Build for Production**: `npm run build`
- **Preview Production**: `npm run preview`

## Backend Requirements
- **Python Dependencies**: flask, flask-cors, Pillow, requests
- **Optional**: HF_TOKEN environment variable for Hugging Face API (uses demo mode if not provided)
- **Endpoints**: /health, /diagnose, /diagnose/upload

## Recent Changes
- September 13, 2025: ✅ **Successfully completed fresh GitHub import setup in Replit environment**
  - Installed Python 3.11 with all required dependencies (flask, cors, pillow, requests, etc.)
  - Installed all npm dependencies for React/Vite frontend
  - Fixed workflow configurations with correct directory paths
  - Verified frontend-backend communication through Vite API proxy (/api routes)
  - Tested health endpoints: backend (port 8000) and frontend proxy (port 5000/api)
  - Configured autoscale deployment with proper build and run commands
  - Both workflows running error-free with proper logs
  - Frontend accessible on port 5000 with HMR working
  - Backend API running on port 8000 with database connection
  - Production deployment configured and ready