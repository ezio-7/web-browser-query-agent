import re
from typing import List, Dict

def normalize_query(query: str) -> str:
    """Normalize query for consistency"""
    # Convert to lowercase
    normalized = query.lower()
    
    # Remove extra whitespace
    normalized = ' '.join(normalized.split())
    
    # Remove special characters except spaces
    normalized = re.sub(r'[^\w\s]', '', normalized)
    
    return normalized.strip()

def format_response(results: list, from_cache: bool = False) -> dict:
    """Format the API response - DEPRECATED, kept for compatibility"""
    return {
        "status": "success",
        "from_cache": from_cache,
        "result_count": len(results),
        "results": [
            {
                "title": r.title,
                "url": r.url,
                "summary": r.summary
            } for r in results
        ]
    }