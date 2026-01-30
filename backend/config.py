import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# MongoDB - Atlas Compatible
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")  # ✅ Uses Render MONGO_URI
MONGO_DB = os.getenv("DB_NAME", "synapso")
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

# Auth / JWT
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# CORS - Production Ready (Updated for Render)
CORS_ORIGINS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173,https://synapso-frontend.onrender.com"
).split(",")]
