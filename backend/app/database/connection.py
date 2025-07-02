from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.models import Base
import time
from sqlalchemy.exc import OperationalError

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            Base.metadata.create_all(bind=engine)
            print("Database initialized successfully!")
            break
            
        except OperationalError as e:
            retry_count += 1
            print(f"Connection error: {e}")
            if retry_count < max_retries:
                print(f"Database connection failed. Retrying in 5 seconds... (Attempt {retry_count}/{max_retries})")
                time.sleep(5)
            else:
                print("Failed to connect to database after maximum retries.")
                raise e
        except Exception as e:
            print(f"Unexpected error: {e}")
            raise e