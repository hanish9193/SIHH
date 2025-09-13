# KisanMitra Setup Guide

## Quick Start (Local Development)

### 1. Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Git installed

### 2. Download and Setup
```bash
# Clone or download the project
git clone <your-repository-url>
cd kisanmitra

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

### 3. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Open .env file and add your API keys:
# - Get Gemini API key from: https://makersuite.google.com/app/apikey
# - Get HuggingFace token from: https://huggingface.co/settings/tokens  
# - Get OpenWeatherMap key from: https://openweathermap.org/api
# - Get Supabase database URL from your Supabase dashboard
```

### 4. Run the Application
```bash
# Terminal 1: Start the backend (runs on port 8000)
python server/plant_diagnosis_api.py

# Terminal 2: Start the frontend (runs on port 5173)
npm run dev

# Access the app at: http://localhost:5173
# Backend API available at: http://localhost:8000
```

## API Keys Required

### Essential Services
1. **DATABASE_URL**: Supabase PostgreSQL connection string
2. **OPENWEATHERMAP_API_KEY**: For weather features
3. **VITE_OPENWEATHERMAP_API_KEY**: Same weather key for frontend

### AI Features (Choose ONE)
4a. **GEMINI_API_KEY**: For intelligent chat assistant (Google Gemini)
4b. **OPENAI_API_KEY**: For intelligent chat assistant (OpenAI ChatGPT)
5. **HF_TOKEN**: For plant disease detection AI

### Optional Services
- **TWILIO_***: For SMS notifications (future feature)

## Troubleshooting

### Common Issues
1. **Backend not starting**: Check if Python dependencies are installed
2. **Frontend build errors**: Run `npm install` again
3. **API errors**: Verify your API keys are correctly set in .env
4. **Database errors**: Check your Supabase connection string

### Verification Commands
```bash
# Test backend health
curl http://localhost:8000/api/health

# Test weather API
curl "http://localhost:8000/api/weather?city=Delhi"

# Check if .env is loaded
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print('✅ Keys loaded' if os.getenv('OPENWEATHERMAP_API_KEY') else '❌ .env not loaded')"

# Test frontend access
open http://localhost:5173
```

## Features Available

### ✅ Core Features (Working)
- Weather monitoring and forecasts
- Agricultural marketplace
- User profiles and authentication
- Database integration (Supabase)
- Mobile-responsive design

### 🔄 AI Features (Requires API Keys)
- Plant disease diagnosis (needs HF_TOKEN)
- Intelligent farming assistant chat (needs GEMINI_API_KEY)

### 📱 Mobile Features
- Progressive Web App (PWA)
- Offline functionality
- Camera integration for plant diagnosis
- Location-based services

## Production Deployment

For production deployment, ensure:
1. Use production database URL
2. Set `FLASK_ENV=production`
3. Use a production WSGI server like Gunicorn
4. Configure proper CORS origins
5. Enable HTTPS for all API keys

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all API keys are correctly formatted
3. Ensure internet connection for external API calls
4. Check that all required ports (5173, 8000) are available

## 🚨 IMPORTANT SECURITY NOTE

If you downloaded this project from a source where .env files might have been committed:
1. **IMMEDIATELY** rotate/revoke any Supabase database credentials
2. **IMMEDIATELY** regenerate any OpenWeatherMap API keys
3. **NEVER** commit .env files with real credentials to version control
4. Always use .env.example for templates and keep .env files local only