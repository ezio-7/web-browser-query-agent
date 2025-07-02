from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from app.database import init_db

app = FastAPI(
    title="Web Browser Query Agent",
    description="AI-powered web search agent with query validation and caching",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {
        "message": "Web Browser Query Agent API",
        "docs": "/docs",
        "health": "ok"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}