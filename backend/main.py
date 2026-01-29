import sys
import os
# FIX: Add CURRENT DIRECTORY to path FIRST
#sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
#sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, '.')


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.users import router as users_router
from backend.routers.swipes import router as swipes_router
from backend.routers.matches import router as matches_router
from backend.routers.messages import router as messages_router
from backend.models import User, Match, Group, Swipe, Message, Chat
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.routers.studyroom import router as studyroom_router
from backend.config import CORS_ORIGINS, MONGO_URI, MONGO_DB

app = FastAPI(title="Synapso API", version="1.0.0", description="Study Partner Matching Platform")



#app = FastAPI(title="Synapso API", version="1.0.0", description="Study Partner Matching Platform")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Startup Event ----------
@app.on_event("startup")
async def app_init():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[MONGO_DB]
        
        # Register all Beanie document models here
        await init_beanie(
            database=db,
            document_models=[
                User, 
                Match, 
                Group, 
                Swipe, 
                Message,  # Added Message model
                Chat      # Added Chat model
            ],
        )
        print("✅ Database connected successfully!")
        print("✅ Models initialized: User, Match, Group, Swipe, Message, Chat")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

# ---------- Routers ----------
#app.include_router(users.router)
#app.include_router(swipes.router)
#app.include_router(matches.router)
#app.include_router(messages.router) 
#app.include_router(studyroom_router)
 # Added messages router

app.include_router(users_router)
app.include_router(swipes_router)
app.include_router(matches_router)
app.include_router(messages_router)
app.include_router(studyroom_router)


@app.get("/")
async def root():
    return {
        "message": "Synapso API is running 🚀",
        "version": "1.0.0",
        "features": [
            "User Authentication",
            "Profile Management", 
            "Smart Matching Algorithm",
            "Swipe System",
            "Real-time Chat",
            "Study Group Creation"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "endpoints": [
            "/users - User management",
            "/swipes - Swiping and recommendations", 
            "/matches - Match management",
            "/messages - Chat system"
        ]
    }