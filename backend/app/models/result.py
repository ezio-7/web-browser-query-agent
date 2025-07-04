from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .query import Base

class SearchResult(Base):
    __tablename__ = "search_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id = Column(UUID(as_uuid=True), ForeignKey("queries.id"))
    url = Column(Text, nullable=False)
    title = Column(Text)
    content = Column(Text)
    summary = Column(Text)
    scraped_at = Column(DateTime, default=datetime.utcnow)
    
    query = relationship("Query", back_populates="results")