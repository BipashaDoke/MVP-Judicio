# JUDICIO - Deployment Guide

## Smart Court Order Intelligence System

This guide covers deploying both backend and frontend components.

---

## Prerequisites

- Node.js 18+ 
- Python 3.11+
- Google Gemini API Key (get from https://makersuite.google.com/app/apikey)

---

## Backend Deployment (Render)

### Step 1: Prepare Backend Code

```bash
cd backend
```

### Step 2: Create .env File

Copy `.env.example` to `.env` and add your API key:

```
GEMINI_API_KEY=your_google_api_key_here
PORT=8000
```

### Step 3: Deploy to Render

1. Create a new Web Service on Render (https://dashboard.render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11
   
4. Add Environment Variables in Render dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `PORT`: 8000
   
5. Deploy!

---

## Frontend Deployment (Vercel)

### Option A: Vercel CLI Deployment

```bash
cd frontend
npm install -g vercel
vercel login
vercel deploy --prod
```

### Option B: Vercel Dashboard Deployment

1. Go to https://vercel.com/dashboard/new-project  
2 import your GitHub repository  
3 Configure:
   - Framework Preset: Vite  
   - Build Command: npm run build  
   
4.Add Environment Variable:
```
VITE_API_URL=https://your-backend-url.onrender.com/api```

5.Deploy!

---

## Running Locally for Development  

### Backend Setup  

```bash  
cd backend  

# Install dependencies  
pip install -r requirements.txt  

# Copy environment file cp .env.example .env # Edit .env with your GEMINI_API_KEY
  
# Run server python app/main.py 
# OR uvicorn app.main:app --reload --port 8000 
``` 

The backend will be available at http://localhost:8000 

API documentation at http://localhost:8000/api/docs   

--- 

### Frontend Setup  

```bash cd frontend npm install npm run dev   
```    

The frontend will be available at http://localhost:5173   

---     
    
## Production Build Test       
        
Before deploying, test production builds locally:

Backend:
        
    cd backend    
    pip install gunicorn    
    gunicorn app.main:app --workers 4     
    
Frontend:

    cd frontend    
    npm run build && npm run preview
