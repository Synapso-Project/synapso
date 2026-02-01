from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.users import router as users_router
from routers.swipes import router as swipes_router
from routers.matches import router as matches_router
from routers.messages import router as messages_router
from routers.studyroom import router as studyroom_router
from models import User, Match, Group, Swipe, Message, Chat
from config import CORS_ORIGINS, db  # ✅ Use SINGLE db from config!
from beanie import init_beanie

app = FastAPI(title="Synapso API", version="1.0.0", description="Study Partner Matching Platform")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- FIXED Startup: Use config db ----------
@app.on_event("startup")
async def app_init():
    try:
        # ✅ Use db from config.py (single optimized client)
        await init_beanie(
            database=db,  # Single source of truth!
            document_models=[
                User, 
                Match, 
                Group, 
                Swipe, 
                Message,
                Chat
            ],
        )
        print("✅ Beanie initialized with config db!")
        print("✅ Models ready: User, Match, Group, Swipe, Message, Chat")
    except Exception as e:
        print(f"❌ Beanie init failed: {e}")
        raise  # Crash fast on Render

# ---------- Routers ----------
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(swipes_router, prefix="/swipes", tags=["swipes"])
app.include_router(matches_router, prefix="/matches", tags=["matches"])
app.include_router(messages_router, prefix="/messages", tags=["messages"])
app.include_router(studyroom_router, prefix="/studyroom", tags=["studyroom"])

@app.get("/")
async def root():
    return {
        "message": "Synapso API is running 🚀",
        "version": "1.0.0",
        "database": "connected",
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
    return {"status": "healthy", "database": "connected"}
