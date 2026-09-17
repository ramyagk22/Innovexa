import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ruraleye.main")

from database.mongodb import db_manager
from services.model_service import model_service
from api import auth, patients, screening, doctor, reports, dashboard

# Ensure required directories exist
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing RuralEye AI decision-support platform (SIH 2026)...")
    try:
        db_manager.connect()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.warning(f"Database setup note: {e}")

    try:
        # Preload the Keras model once during startup
        _ = model_service.model
        logger.info("DR EfficientNetB0 Keras model loaded and ready in memory.")
    except Exception as e:
        logger.error(f"DR model loading error on startup: {e}")

    yield
    logger.info("Shutting down RuralEye AI backend.")

app = FastAPI(
    title="RuralEye AI Backend",
    description="Explainable AI for Diabetic Retinopathy Screening in Rural India (SIH 2026 | ID: 26038)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file mounts for uploads and heatmaps
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include API Routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(screening.router)
app.include_router(doctor.router)
app.include_router(reports.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {
        "project": "RuralEye AI",
        "competition": "Smart India Hackathon 2026",
        "problem_statement_id": "26038",
        "theme": "MedTech / BioTech / HealthTech",
        "team": "Innovexa",
        "tagline": "Quality-First, Explainable Diabetic Retinopathy Screening",
        "model_loaded": model_service.model is not None,
        "database_connected": db_manager.is_connected or db_manager.use_fallback,
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("main:app", host=host, port=port, reload=True)
