# Create .env.example
content = """# JUDICIO - Environment Variables
# Copy this file to .env and fill in your values

# Google Gemini API Key (Required)
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSyCfUh9oWAn0R6TRURpIolFtKnRdbFVAf_M

# Server Configuration
PORT=8000
HOST=0.0.0.0

# Environment
ENVIRONMENT=development
"""

with open('backend/.env.example', 'w', encoding='utf-8') as f:
    f.write(content)

print('.env.example created successfully')
