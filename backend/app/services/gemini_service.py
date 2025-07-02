import google.generativeai as genai
from app.config import settings
from typing import Optional

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def generate_content(self, prompt: str) -> Optional[str]:
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error generating content: {e}")
            try:
                models = genai.list_models()
                print("Available models:")
                for model in models:
                    if 'generateContent' in model.supported_generation_methods:
                        print(f"  - {model.name}")
            except:
                pass
            return None

gemini_service = GeminiService()