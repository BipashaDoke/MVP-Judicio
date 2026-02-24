import os
import json
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
api = os.getenv('GEMINI_API_KEY')
print('API present:', bool(api))
if api:
    genai.configure(api_key=api)
try:
    models = genai.list_models()
    # models may be dict with 'models' or list
    if isinstance(models, dict) and 'models' in models:
        models_list = models['models']
    else:
        models_list = models
    for m in models_list:
        print('-' * 40)
        if isinstance(m, dict):
            for k,v in m.items():
                print(f"{k}: {v}")
        else:
            print(m)
except Exception as e:
    print('ERROR', e)
