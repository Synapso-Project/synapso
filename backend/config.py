import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from ssl import SSLContext, CERT_NONE

load_dotenv()

# MongoDB Atlas - Render SSL Fixed ✅
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("DB_NAME", "synapso")

# SSL Context for Render
ssl_context = SSLContext()
ssl_context.check_hostname = False
ssl_context.verify_mode = CERT_NONE

client = AsyncIOMotorClient(
    MONGO_URI,
    ssl=ssl_context,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
    heartbeatFrequencyMS=10000
)
db = client[MONGO_DB]

# Auth / JWT
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# CORS - FIXED
CORS_ORIGINS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173,https://synapso-frontend.onrender.com"
).split(",")]
