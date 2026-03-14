# JUDICIO - Smart Court Order Intelligence System

AI-powered legal document analysis platform that extracts structured information from court orders.

## Features

- PDF upload and text extraction
- AI-powered legal metadata extraction (case number, parties, judgment, dates, directions)
- Multilingual output (English, Hindi, Marathi)
- Professional summaries and citizen-friendly explanations
- Risk assessment tags

## Tech Stack

### Backend
- Python 3.11
- FastAPI
- pdfplumber
- Google Gemini API

### Frontend
- React 18
- Tailwind CSS
- react-i18next
- Framer Motion

## Quick Start

### Backend

```
bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GEMINI_API_KEY
python -m uvicorn app.main:app --reload
```

### Frontend

```
bash
cd frontend
npm install
npm run dev
```

## Deployment

See DEPLOYMENT.md for detailed instructions.

## API Endpoints

- `POST /api/upload` - Upload and analyze PDF
- `GET /api/health` - Health check

## License

MIT
# MVp
# MVp
