# Create render.yaml
content = """services:
  - type: web
    name: judiciod-backend
    env: python
    region: oregon
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: PORT
        value: 8000
"""

with open('backend/render.yaml', 'w', encoding='utf-8') as f:
    f.write(content)

print('render.yaml created successfully')
