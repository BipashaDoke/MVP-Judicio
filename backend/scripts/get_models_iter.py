import os
import json
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai

api = os.getenv('GEMINI_API_KEY')
print('API present:', bool(api))
if not api:
    print('No API key set; exiting')
    raise SystemExit(1)

try:
    genai.configure(api_key=api)
    # list_models() may be a generator; iterate it
    for m in genai.list_models():
        try:
            # If model is dict-like
            if isinstance(m, dict):
                name = m.get('name') or m.get('id') or m.get('model')
                print('MODEL:', name)
                for k,v in m.items():
                    # pretty-print nested items
                    print(f'  {k}: {json.dumps(v, default=str)}')
            else:
                print('MODEL:', m)
        except Exception as e:
            print('Error printing model entry:', e)
except Exception as e:
    print('ERROR calling list_models():', e)
