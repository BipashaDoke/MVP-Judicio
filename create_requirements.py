# Backend requirements
content = """# JUDICIO Backend Requirements
# Smart Court Order Intelligence System

# Web Framework
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
python-multipart>=0.0.6

# PDF Processing
pdfplumber>=0.10.3

# AI/ML
google-generativeai>=0.3.2

# Environment
python-dotenv>=1.0.0

# Validation
pydantic>=2.5.0

# CORS
aiofiles>=23.2.1
"""

with open('backend/requirements.txt', 'w', encoding='utf-8') as f:
    f.write(content)

print('requirements.txt created successfully')
