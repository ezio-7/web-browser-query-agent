from app.services import gemini_service
from typing import Tuple

class QueryValidatorAgent:
    def __init__(self):
        self.gemini = gemini_service
    
    async def validate_query(self, query: str) -> Tuple[bool, str]:
        prompt = f"""
        You are a query validation agent. Analyze the following query and determine if it's a valid web search query.
        
        Invalid queries include:
        - Personal commands (e.g., "walk my pet", "call someone")
        - Multiple unrelated tasks in one query
        - Non-searchable personal actions
        - Gibberish or meaningless text
        
        Valid queries include:
        - Information seeking questions
        - Topic searches
        - How-to queries
        - Facts and data requests
        
        Query: "{query}"
        
        Respond with ONLY "VALID" or "INVALID" followed by a brief reason.
        Format: VALID|reason or INVALID|reason
        """
        
        try:
            response = await self.gemini.generate_content(prompt)
            if response:
                parts = response.strip().split('|', 1)
                is_valid = parts[0].strip().upper() == "VALID"
                reason = parts[1].strip() if len(parts) > 1 else ""
                return is_valid, reason
            return False, "Unable to validate query"
        except Exception as e:
            print(f"Validation error: {e}")
            return False, "Validation service error"

query_validator_agent = QueryValidatorAgent()