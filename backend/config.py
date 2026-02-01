import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# MongoDB Atlas - Render Compatible ✅
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("DB_NAME", "synapso")

# ✅ CRITICAL: Validate connection (fails fast if wrong)
if not MONGO_URI:
    raise ValueError("❌ MONGO_URI environment variable is required!")
if "mongodb+srv://" not in MONGO_URI:
    raise ValueError("❌ MONGO_URI must be Atlas format: mongodb+srv://...")

client = AsyncIOMotorClient(
    MONGO_URI,
    serverSelectionTimeoutMS=10000,  # Increased for Render
    connectTimeoutMS=15000,
    maxPoolSize=20,  # Render optimization
    minPoolSize=2,
    retryWrites=True
)
db = client[MONGO_DB]

# Auth / JWT
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ✅ CORS - Updated for Vite + Production
CORS_ORIGINS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", 
    "https://synapso-app.onrender.com,http://localhost:5173,http://127.0.0.1:5173"
).split(",")]
