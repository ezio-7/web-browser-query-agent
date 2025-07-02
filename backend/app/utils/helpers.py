import re
from typing import List, Dict

def normalize_query(query: str) -> str:
    normalized = query.lower()
    
    normalized = ' '.join(normalized.split())
    
    normalized = re.sub(r'[^\w\s]', '', normalized)
    
    return normalized.strip()

def format_response(results: list, from_cache: bool = False) -> dict:
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