"""
Point d'entree FastAPI pour l'API EpiGraph.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .routers import patients, infections, analytics, predictions, hospitals
from .services.neo4j_service import Neo4jService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application."""
    # Startup
    app.state.neo4j = Neo4jService()
    print("Connexion Neo4j etablie")
    yield
    # Shutdown
    app.state.neo4j.close()
    print("Connexion Neo4j fermee")


app = FastAPI(
    title="EpiGraph API",
    description="API d'analyse epidemiologique avec Neo4j",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routes
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(infections.router, prefix="/api/infections", tags=["Infections"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(hospitals.router, prefix="/api/hospitals", tags=["Hospitals"])


@app.get("/health")
async def health_check():
    """Verification de sante du service."""
    return {"status": "healthy", "service": "epigraph-api"}


@app.get("/")
async def root():
    """Point d'entree racine."""
    return {
        "message": "EpiGraph API",
        "docs": "/docs",
        "version": "1.0.0"
    }
