from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models import Query, SearchResult, QueryGroup, QueryGroupMapping
from typing import List, Optional
import uuid

class QueryCRUD:
    @staticmethod
    def create_query(db: Session, original_query: str, normalized_query: str, embedding: List[float]) -> Query:
        query = Query(
            original_query=original_query,
            normalized_query=normalized_query,
            embedding=embedding
        )
        db.add(query)
        db.commit()
        db.refresh(query)
        return query
    
    @staticmethod
    def get_similar_queries(db: Session, embedding: List[float], threshold: float) -> List[Query]:
        # Using pgvector's <=> operator for cosine distance
        similar = db.query(Query).filter(
            Query.embedding.cosine_distance(embedding) < (1 - threshold)
        ).all()
        return similar
    
    @staticmethod
    def get_query_by_id(db: Session, query_id: uuid.UUID) -> Optional[Query]:
        return db.query(Query).filter(Query.id == query_id).first()

class SearchResultCRUD:
    @staticmethod
    def create_results(db: Session, query_id: uuid.UUID, results: List[dict]) -> List[SearchResult]:
        search_results = []
        for result in results:
            sr = SearchResult(
                query_id=query_id,
                url=result['url'],
                title=result['title'],
                content=result['content'],
                summary=result['summary']
            )
            db.add(sr)
            search_results.append(sr)
        
        db.commit()
        return search_results
    
    @staticmethod
    def get_results_by_query_id(db: Session, query_id: uuid.UUID) -> List[SearchResult]:
        return db.query(SearchResult).filter(SearchResult.query_id == query_id).all()

class QueryGroupCRUD:
    @staticmethod
    def create_group(db: Session, representative_query_id: uuid.UUID) -> QueryGroup:
        group = QueryGroup(representative_query_id=representative_query_id)
        db.add(group)
        db.commit()
        db.refresh(group)
        return group
    
    @staticmethod
    def add_query_to_group(db: Session, query_id: uuid.UUID, group_id: uuid.UUID):
        mapping = QueryGroupMapping(query_id=query_id, group_id=group_id)
        db.add(mapping)
        db.commit()
    
    @staticmethod
    def get_group_by_query_id(db: Session, query_id: uuid.UUID) -> Optional[QueryGroup]:
        mapping = db.query(QueryGroupMapping).filter(
            QueryGroupMapping.query_id == query_id
        ).first()
        
        if mapping:
            return db.query(QueryGroup).filter(
                QueryGroup.id == mapping.group_id
            ).first()
        return None