from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

# Load environment variables first
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from database import init_db, DATABASE_NAME
from models import Product, User, Order, Review, SiteSettings
from beanie import init_beanie
from routers import products, orders, users, upload, settings
import os

app = FastAPI(title="Baba Dairy API")

# CORS setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event for database connection
@app.on_event("startup")
async def start_db():
    logger.info("Initializing MongoDB connection...")
    try:
        client = await init_db()
        db_name = os.getenv("DATABASE_NAME", "babadairy")
        await init_beanie(database=client[db_name], document_models=[Product, User, Order, Review, SiteSettings])
        logger.info(f"MongoDB initialized successfully. Database: {db_name}")
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB: {e}")
        # In production, you might want to retry or exit
        # For dev, we log it.

# Include routers
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(users.router)
app.include_router(upload.router)
app.include_router(settings.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Baba Dairy API (MongoDB)"}
