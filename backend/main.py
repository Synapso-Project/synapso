from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.users import router as users_router
from routers.swipes import router as swipes_router
from routers.matches import router as matches_router
from routers.messages import router as messages_router
from routers.studyroom import router as studyroom_router
from models import User, Match, Group, Swipe, Message, Chat
from config import CORS_ORIGINS, db
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

# ---------- FIXED Startup: Use config db + ROUTE DEBUG ----------
@app.on_event("startup")
async def app_init():
    try:
        # ✅ Initialize Beanie
        await init_beanie(
            database=db,
            document_models=[User, Match, Group, Swipe, Message, Chat]
        )
        print("✅ Beanie initialized with config db!")
        print("✅ Models ready: User, Match, Group, Swipe, Message, Chat")
        
        # ✅ DEBUG: Verify ALL ROUTERS LOADED
        print("\n🚀 ROUTES REGISTERED:")
        route_count = 0
        for route in app.routes:
            if hasattr(route, 'path'):
                print(f"  {list(route.methods)} {route.path}")
                route_count += 1
        print(f"✅ TOTAL ROUTES: {route_count}")
        
        # ✅ Count users for recommendations
        user_count = await User.count()
        print(f"✅ USERS IN DB: {user_count}")
        
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        import traceback
        traceback.print_exc()
        raise

# ---------- ROUTERS WITH PREFIXES ----------
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(swipes_router, prefix="/swipes", tags=["swipes"])
app.include_router(matches_router, prefix="/matches", tags=["matches"])
app.include_router(messages_router, prefix="/messages", tags=["messages"])
app.include_router(studyroom_router, prefix="/studyroom", tags=["studyroom"])

@app.get("/")
async def root():
    return {
        "message": "Synapso API LIVE 🚀",
        "version": "1.0.0",
        "database": "connected",
        "available_routes": [
            "/users/login (POST)",
            "/users/me (GET)", 
            "/swipes/recommendations (GET)",
            "/swipes/ (POST)",
            "/matches (GET)"
        ],
        "status": "ALL ROUTES READY"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# ✅ DEBUG: Test route registration
@app.get("/debug/routes")
async def debug_routes():
    """DEBUG: List all registered routes"""
    routes = []
    for route in app.routes:
        if hasattr(route, 'path'):
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": getattr(route, 'name', 'unknown')
            })
    return {"total_routes": len(routes), "routes": routes}
