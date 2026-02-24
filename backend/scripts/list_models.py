import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
print('Using API key:', bool(api_key))
try:
    genai.configure(api_key=api_key)
    models = genai.list_models()
    print(json.dumps(models, indent=2, default=str))
except Exception as e:
    print('ERROR:', e)
