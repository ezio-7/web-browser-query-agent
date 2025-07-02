from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid

from app.database import get_db
from app.database.crud import QueryCRUD, SearchResultCRUD
from app.models import Query
from app.agents import (
    query_validator_agent,
    similarity_agent,
    web_scraper_agent,
    summarizer_agent
)
from app.services import embedding_service
from app.utils import normalize_query

router = APIRouter(prefix="/api", tags=["search"])

class SearchRequest(BaseModel):
    query: str

class SearchResponse(BaseModel):
    status: str
    message: Optional[str] = None
    from_cache: bool = False
    summary: Optional[str] = None
    sources: List[dict] = []

@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest, db: Session = Depends(get_db)):
    """Main search endpoint"""
    
    # Step 1: Validate query
    is_valid, reason = await query_validator_agent.validate_query(request.query)
    
    if not is_valid:
        return SearchResponse(
            status="invalid",
            message=f"This is not a valid query. {reason}",
            sources=[]
        )
    
    # Step 2: Normalize query
    normalized = normalize_query(request.query)
    
    # Step 3: Check for similar queries using AI agent
    similar_query_id = await similarity_agent.find_similar_query(db, request.query)
    
    if similar_query_id:
        # Get cached results
        cached_results = SearchResultCRUD.get_results_by_query_id(db, similar_query_id)
        if cached_results and cached_results[0].summary:  # Assuming we store the summary
            return SearchResponse(
                status="success",
                from_cache=True,
                summary=cached_results[0].summary,
                sources=[{
                    "title": r.title,
                    "url": r.url
                } for r in cached_results]
            )
    
    # Step 4: Generate embedding for the new query
    embedding = embedding_service.generate_embedding(normalized)
    
    # Step 5: Create new query
    new_query = QueryCRUD.create_query(db, request.query, normalized, embedding)
    
    # Step 6: Perform web search and scraping
    scraped_results = await web_scraper_agent.search_and_scrape(request.query)
    
    if not scraped_results:
        return SearchResponse(
            status="success",
            message="No results found for your query.",
            summary="I couldn't find any relevant information for your query. Please try rephrasing or being more specific.",
            sources=[]
        )
    
    # Step 7: Generate a single comprehensive summary
    summary = await summarizer_agent.summarize_results(request.query, scraped_results)
    
    # Step 8: Save results to database with the summary
    saved_results = []
    for result in scraped_results:
        saved_results.append({
            'url': result['url'],
            'title': result['title'],
            'content': result['content'],
            'summary': summary  # Store the main summary with the first result
        })
    
    SearchResultCRUD.create_results(db, new_query.id, saved_results)
    
    # Step 9: Group with similar queries if found
    if similar_query_id:
        similarity_agent.group_similar_queries(db, new_query.id, similar_query_id)
    
    return SearchResponse(
        status="success",
        from_cache=False,
        summary=summary,
        sources=[{
            "title": r['title'],
            "url": r['url']
        } for r in scraped_results]
    )

@router.get("/search/history")
async def get_search_history(db: Session = Depends(get_db)):
    """Get search history"""
    queries = db.query(Query).order_by(Query.created_at.desc()).limit(50).all()
    
    return {
        "queries": [{
            "id": str(q.id),
            "query": q.original_query,
            "created_at": q.created_at.isoformat()
        } for q in queries]
    }

@router.get("/search/{query_id}")
async def get_query_details(query_id: str, db: Session = Depends(get_db)):
    """Get details of a specific query"""
    try:
        query_uuid = uuid.UUID(query_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid query ID format")
    
    query = QueryCRUD.get_query_by_id(db, query_uuid)
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    
    results = SearchResultCRUD.get_results_by_query_id(db, query_uuid)
    
    # Get the summary from the first result (where we stored it)
    summary = results[0].summary if results else None
    
    return {
        "query": {
            "id": str(query.id),
            "original_query": query.original_query,
            "normalized_query": query.normalized_query,
            "created_at": query.created_at.isoformat()
        },
        "summary": summary,
        "sources": [{
            "title": r.title,
            "url": r.url,
            "scraped_at": r.scraped_at.isoformat()
        } for r in results]
    }