from app.services import gemini_service, embedding_service
from app.database.crud import QueryCRUD, QueryGroupCRUD
from app.models import Query 
from app.config import settings
from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
import uuid
import json

class SimilarityAgent:
    def __init__(self):
        self.gemini = gemini_service
        self.embedding_service = embedding_service
        self.threshold = settings.SIMILARITY_THRESHOLD
    
    async def find_similar_query(self, db: Session, query: str) -> Optional[uuid.UUID]:
        all_queries = db.query(Query).all()
        
        if not all_queries:
            return None
        
        similar_query_id = await self._check_similarity_with_ai(query, all_queries)
        
        if similar_query_id:
            return similar_query_id
        
        embedding = self.embedding_service.generate_embedding(query)
        similar_queries = QueryCRUD.get_similar_queries(db, embedding, self.threshold)
        
        if similar_queries:
            confirmed_similar = await self._confirm_similarity_with_ai(query, similar_queries[0].original_query)
            if confirmed_similar:
                return similar_queries[0].id
        
        return None
    
    async def _check_similarity_with_ai(self, new_query: str, existing_queries: List) -> Optional[uuid.UUID]:
        
        query_batch = []
        for eq in existing_queries[:20]:
            query_batch.append({
                "id": str(eq.id),
                "query": eq.original_query
            })
        
        prompt = f"""
        You are a similarity detection agent. Your task is to determine if a new search query is semantically similar to any existing queries.
        
        New Query: "{new_query}"
        
        Existing Queries:
        {json.dumps(query_batch, indent=2)}
        
        Queries are considered similar if they:
        1. Ask for the same information in different words
        2. Have the same search intent
        3. Would return similar or identical search results
        
        Examples of similar queries:
        - "Best places to visit in Delhi" and "Top tourist attractions in Delhi"
        - "How to learn Python" and "Python learning resources"
        - "Weather in New York" and "New York weather forecast"
        
        If you find a similar query, respond with: SIMILAR|<query_id>
        If no similar query exists, respond with: NONE
        
        Important: Only mark queries as similar if they have the same search intent and would return similar results.
        """
        
        try:
            response = await self.gemini.generate_content(prompt)
            if response:
                result = response.strip()
                if result.startswith("SIMILAR|"):
                    query_id_str = result.split("|", 1)[1].strip()
                    return uuid.UUID(query_id_str)
        except Exception as e:
            print(f"AI similarity check error: {e}")
        
        return None
    
    async def _confirm_similarity_with_ai(self, query1: str, query2: str) -> bool:
        
        prompt = f"""
        Are these two search queries asking for similar information? Answer YES or NO.
        
        Query 1: "{query1}"
        Query 2: "{query2}"
        
        Consider them similar if they:
        - Have the same search intent
        - Would return similar search results
        - Ask for the same information in different words
        
        Respond with only YES or NO.
        """
        
        try:
            response = await self.gemini.generate_content(prompt)
            if response:
                return response.strip().upper() == "YES"
        except Exception as e:
            print(f"AI confirmation error: {e}")
        
        return False
    
    def group_similar_queries(self, db: Session, new_query_id: uuid.UUID, similar_query_id: uuid.UUID):
        existing_group = QueryGroupCRUD.get_group_by_query_id(db, similar_query_id)
        
        if existing_group:
            QueryGroupCRUD.add_query_to_group(db, new_query_id, existing_group.id)
        else:
            new_group = QueryGroupCRUD.create_group(db, similar_query_id)
            QueryGroupCRUD.add_query_to_group(db, similar_query_id, new_group.id)
            QueryGroupCRUD.add_query_to_group(db, new_query_id, new_group.id)

similarity_agent = SimilarityAgent()