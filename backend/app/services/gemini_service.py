"""
JUDICIO - Gemini AI Service
Uses Google Gemini API for legal document analysis
"""

import google.generativeai as genai
import json
import re
import logging
from typing import Optional
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Ensure info logs are shown for diagnostics
logging.basicConfig(level=logging.INFO)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


# Prompt template for legal document analysis
LEGAL_ANALYSIS_PROMPT = """You are a highly skilled legal document analyst specializing in Indian court orders and legal judgments. Your task is to analyze the given court order document and extract structured information.

STRICT JSON OUTPUT REQUIRED - Output ONLY valid JSON, no other text.

Analyze the court order and extract:

1. language_detected: Detect the primary language of the document (english/hindi/marathi/other)

2. metadata:
   - case_number: The official case number (string)
   - parties: List of all parties involved (strings)
   - judgment_outcome: The final judgment/decision. **Provide translations** as an object with keys `english`, `hindi`, and `marathi`.
   - important_dates: An array of objects, each containing:
       * date: the date string
       * description: a description of the event. **Provide translations** (english/hindi/marathi) for the description.
   - legal_directions: Array of directions or orders. Each item should include translations (english/hindi/marathi).
   - risk_tags: Array of risk assessment tags; each tag should include translations (english/hindi/marathi).

3. summary (Professional legal summary):
   - english: Summary in English
   - hindi: Summary in Hindi
   - marathi: Summary in Marathi

4. explanation (Citizen-friendly explanation):
   - english: Plain English explanation
   - hindi: Plain Hindi explanation
   - marathi: Plain Marathi explanation

IMPORTANT: Output ONLY valid JSON, no explanatory text. Use null for missing fields.

Document to analyze:
"""

# Code block markers
BACKTICK = chr(96)
JSON_START = BACKTICK * 3 + "json"
CODE_START = BACKTICK * 3
CODE_END = BACKTICK * 3

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini service"""
        self.model = None
        self.logger = logging.getLogger(__name__)
        if GEMINI_API_KEY:
            try:
                # Determine model name at initialization (pick up new .env values)
                model_name = os.getenv("GEMINI_MODEL", "gemini-pro")
                self.logger.info("Initializing Gemini model: %s", model_name)
                self.model = genai.GenerativeModel(model_name)
            except Exception as e:
                # Log the error and attempt to list available models for diagnosis
                self.logger.error("Error initializing Gemini model: %s", e)
                try:
                    # genai.list_models() may return a generator of Model objects
                    available = genai.list_models()
                    model_candidates = []
                    for m in available:
                        # Model object may have attributes; handle dicts and objects
                        name = None
                        supports_generate = False
                        if isinstance(m, dict):
                            name = m.get('name') or m.get('id') or m.get('model')
                            methods = m.get('supported_generation_methods') or []
                            supports_generate = 'generateContent' in methods
                        else:
                            # attempt attribute access
                            name = getattr(m, 'name', None) or getattr(m, 'id', None) or str(m)
                            methods = getattr(m, 'supported_generation_methods', None)
                            if methods:
                                supports_generate = 'generateContent' in methods
                        if name:
                            model_candidates.append((name, supports_generate))

                    self.logger.info("Discovered models (name,supports_generate): %s", model_candidates)

                    # Prefer first model that supports generateContent
                    fallback = None
                    for name, supports in model_candidates:
                        if supports:
                            fallback = name
                            break
                    # If none explicitly support generateContent, pick first available
                    if not fallback and model_candidates:
                        fallback = model_candidates[0][0]

                    if fallback:
                        try:
                            self.logger.info("Attempting fallback model: %s", fallback)
                            self.model = genai.GenerativeModel(fallback)
                        except Exception as e2:
                            self.logger.error("Fallback model initialization failed: %s", e2)
                except Exception as list_err:
                    self.logger.error("Failed to list available models: %s", list_err)
    
    def analyze_legal_document(self, document_text: str) -> dict:
        """Analyze legal document using Gemini AI"""
        if not self.model:
            raise ValueError("Gemini API not configured. Please set GEMINI_API_KEY in .env file")
        
        max_chars = 30000
        if len(document_text) > max_chars:
            document_text = document_text[:max_chars] + "\n\n[Document truncated due to length...]"
        
        try:
            response = self.model.generate_content(
                LEGAL_ANALYSIS_PROMPT + document_text,
                generation_config={
                    "temperature": 0.1,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 8192,
                    "response_mime_type": "application/json"
                }
            )
            
            response_text = response.text
            
            # Clean markdown formatting
            cleaned = response_text.strip()
            if cleaned.startswith(JSON_START):
                cleaned = cleaned[len(JSON_START):]
            elif cleaned.startswith(CODE_START):
                cleaned = cleaned[len(CODE_START):]
            if cleaned.endswith(CODE_END):
                cleaned = cleaned[:-len(CODE_END)]
            cleaned = cleaned.strip()
            
            try:
                result = json.loads(cleaned)
            except json.JSONDecodeError:
                json_match = re.search(r'\{[\s\S]*\}', cleaned)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise ValueError("Failed to parse AI response as JSON")
            
            if not isinstance(result, dict):
                raise ValueError("AI response is not a valid JSON object")
            
            return result
            
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"AI analysis failed: {str(e)}")
    
    def validate_response(self, response: dict) -> bool:
        """Validate that response has required fields"""
        required_fields = ["language_detected", "metadata", "summary", "explanation"]
        return all(field in response for field in required_fields)

# Singleton instance
gemini_service = GeminiService()
