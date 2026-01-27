"""
Configuration du backend FastAPI.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration de l'application."""
    
    # Neo4j
    neo4j_uri: str = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user: str = os.environ.get("NEO4J_USER", "neo4j")
    neo4j_password: str = os.environ.get("NEO4J_PASSWORD", "")
    
    # API
    api_host: str = os.environ.get("API_HOST", "0.0.0.0")
    api_port: int = int(os.environ.get("API_PORT", "8000"))
    
    # ML Models
    models_dir: str = os.environ.get("MODELS_DIR", "./models")
    
    class Config:
        env_file = ".env"


settings = Settings()
