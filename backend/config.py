import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# MongoDB Atlas - Render Compatible ✅
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("DB_NAME", "synapso")

client = AsyncIOMotorClient(
    MONGO_URI,
    tls=True,  # ✅ Simple SSL fix for Atlas
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000
)
db = client[MONGO_DB]

# Auth / JWT
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# CORS - Production Ready
CORS_ORIGINS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", 
    "https://synapso-app.onrender.com"
).split(",")]
