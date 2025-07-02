# BACKEND

## Installation Steps

### 1. Clone the project and create virtual environment

### 2. Install dependencies

```BASH
pip install -r requirements.txt
```

### 3. Setup PostgreSQL with pgvector

```BASH
docker-compose up -d
```

### 4. Get Gemini API Key

- Go to [Gemini API](https://aistudio.google.com/apikey)
- Create a new API key
- Copy the API key

### 5. Create .env file

```ENV
DATABASE_URL=postgresql://user:password@localhost:5432/query_agent_db
GEMINI_API_KEY=your_actual_gemini_api_key_here
EMBEDDING_MODEL=all-MiniLM-L6-v2
SIMILARITY_THRESHOLD=0.85
```

### 6. Initialize the database

```BASH
python init_db.py
```

### 7. Run the application

```BASH
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at [http://localhost:8000](http://localhost:8000)

### 8. Access API documentation

Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser to see the API documentation.

## Testing the API

### 1. Using Postman, import the collection.json file into Postman

### 2. Test the endpoints

- Search Query: Send a valid search query
- Invalid Query Test: Test with invalid queries
- Similar Query Tests: Test caching with similar queries
- Search History: View past searches
- Query Details: Get details of a specific search

### 3. API Endpoints

- `POST /api/search` - Main search endpoint
- `GET /api/search/history` - Get search history
- `GET /api/search/{query_id}` - Get specific query details
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation
