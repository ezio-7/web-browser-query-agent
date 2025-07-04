from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid
from datetime import datetime

Base = declarative_base()

class Query(Base):
    __tablename__ = "queries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    original_query = Column(Text, nullable=False)
    normalized_query = Column(Text, nullable=False)
    embedding = Column(Vector(384))  # 384 for all-MiniLM-L6-v2
    created_at = Column(DateTime, default=datetime.utcnow)
    
    results = relationship("SearchResult", back_populates="query")
    group_mappings = relationship("QueryGroupMapping", back_populates="query")

class QueryGroup(Base):
    __tablename__ = "query_groups"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    representative_query_id = Column(UUID(as_uuid=True), ForeignKey("queries.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mappings = relationship("QueryGroupMapping", back_populates="group")

class QueryGroupMapping(Base):
    __tablename__ = "query_group_mappings"
    
    query_id = Column(UUID(as_uuid=True), ForeignKey("queries.id"), primary_key=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("query_groups.id"), primary_key=True)
    
    query = relationship("Query", back_populates="group_mappings")
    group = relationship("QueryGroup", back_populates="mappings")