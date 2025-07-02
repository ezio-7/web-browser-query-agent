from sentence_transformers import SentenceTransformer
from app.config import settings
from typing import List
import numpy as np

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
    
    def generate_embedding(self, text: str) -> List[float]:
        embedding = self.model.encode(text)
        return embedding.tolist()
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        # Cosine similarity
        a = np.array(embedding1)
        b = np.array(embedding2)
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

embedding_service = EmbeddingService()