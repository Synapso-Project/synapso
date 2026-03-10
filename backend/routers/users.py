from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId
import traceback

from models import User, Match, Swipe
from schemas import UserCreate, UserLogin, UserPublic, TokenResponse, UserProfileUpdate, ProfileUpdateResponse
from config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(tags=["users"])

# ---------- Password Hashing (RENDER-SAFE) ----------
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

# ---------- Authentication ----------
security = HTTPBearer()

def hash_password(password: str) -> str:
    safe_password = password[:72]
    return pwd_context.hash(safe_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    safe_password = plain_password[:72]
    return pwd_context.verify(safe_password, hashed_password)

# ---------- JWT Helpers ----------
def create_access_token(data: dict, expires_delta: int = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=expires_delta or ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str):
    try:
        print(f"🔍 DEBUG: Verifying token: {token[:30]}...")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        print(f"✅ DEBUG: Payload decoded: {payload}")
        user_id: str = payload.get("sub")
        print(f"✅ DEBUG: Extracted user_id: {user_id}")
        
        if user_id is None:
            print("❌ DEBUG: No user_id in payload")
            raise HTTPException(status_code=401, detail="No user_id in token")
        return user_id
        
    except jwt.ExpiredSignatureError as e:
        print(f"❌ DEBUG: Token expired: {e}")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError as e:
        print(f"❌ DEBUG: JWT Error: {e}")
        print(f"❌ DEBUG: Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"❌ DEBUG: Unexpected error: {e}")
        print(f"❌ DEBUG: Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Token verification failed")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    print(f"🔍 DEBUG: get_current_user called with scheme: {credentials.scheme}")
    print(f"🔍 DEBUG: Token length: {len(credentials.credentials)}")
    
    token = credentials.credentials
    user_id = verify_token(token)
    print(f"🔍 DEBUG: Looking up user: {user_id}")
    
    user = await User.get(user_id)
    if user is None:
        print(f"❌ DEBUG: User {user_id} not found in DB")
        raise HTTPException(status_code=401, detail="User not found")
    
    print(f"✅ DEBUG: Found user: {user.email}")
    return user

# 🔥 CRITICAL NEW ENDPOINT - FIXES "SAVE & SWIPE" 405 ERROR
class ProfileUpdateSchema(BaseModel):
    subjects: list[str] = []
    availability: list[str] = []
    bio: str = ""
    study_habits: list[str] = []
    interests: list[str] = []
    study_style: str = ""
    preferred_study_time: str = ""
    study_location: str = ""
    profile_completed: bool = True

@router.post("/profile", response_model=dict)
async def update_profile(
    profile_data: ProfileUpdateSchema,
    current_user: User = Depends(get_current_user)
):
    """Complete user profile setup after signup - FIXES 405 ERROR"""
    try:
        print(f"🔥 UPDATING PROFILE for {current_user.email}")
        print(f"Profile data: {profile_data.dict()}")
        
        # Update user document with ALL profile fields
        update_dict = {
            "subjects": profile_data.subjects,
            "availability": profile_data.availability,
            "bio": profile_data.bio,
            "study_habits": profile_data.study_habits,
            "interests": profile_data.interests,
            "study_style": profile_data.study_style,
            "preferred_study_time": profile_data.preferred_study_time,
            "study_location": profile_data.study_location,
            "profile_completed": profile_data.profile_completed
        }
        
        # Remove empty fields
        update_dict = {k: v for k, v in update_dict.items() if v or v == False}
        
        await current_user.set(update_dict)
        print(f"✅ Profile updated successfully for {current_user.username}")
        
        return {
            "message": "Profile updated successfully",
            "profile_completed": True,
            "username": current_user.username
        }
        
    except Exception as e:
        print(f"❌ Profile update error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Profile update failed")

# ---------- Routes (UNCHANGED - ALL WORKING) ----------
@router.post("/signup", response_model=UserPublic)
async def signup(user: UserCreate):
    existing = await User.find_one(User.email == user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password=hashed_pw,
        subjects=user.subjects or [],
        availability=user.availability or [],
    )
    await db_user.insert()

    return UserPublic(
        id=str(db_user.id),
        username=db_user.username,
        email=db_user.email,
        subjects=db_user.subjects,
        availability=db_user.availability,
    )

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    db_user = await User.find_one(User.email == user.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {"sub": str(db_user.id), "email": db_user.email}
    access_token = create_access_token(token_data)

    user_data = UserPublic(
        id=str(db_user.id),
        username=db_user.username,
        email=db_user.email,
        subjects=db_user.subjects or [],
        availability=db_user.availability or [],
        bio=getattr(db_user, 'bio', None),
        study_habits=getattr(db_user, 'study_habits', []),
        interests=getattr(db_user, 'interests', []),
        study_style=getattr(db_user, 'study_style', None),
        preferred_study_time=getattr(db_user, 'preferred_study_time', None),
        study_location=getattr(db_user, 'study_location', None),
        academic_level=getattr(db_user, 'academic_level', None),
        goals=getattr(db_user, 'goals', [])
    )

    return TokenResponse(access_token=access_token, user=user_data)

@router.get("/profile", response_model=UserPublic)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserPublic(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        subjects=current_user.subjects or [],
        availability=current_user.availability or [],
        bio=getattr(current_user, 'bio', None),
        study_habits=getattr(current_user, 'study_habits', []),
        interests=getattr(current_user, 'interests', []),
        study_style=getattr(current_user, 'study_style', None),
        preferred_study_time=getattr(current_user, 'preferred_study_time', None),
        study_location=getattr(current_user, 'study_location', None),
        academic_level=getattr(current_user, 'academic_level', None),
        goals=getattr(current_user, 'goals', [])
    )

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "subjects": getattr(current_user, 'subjects', []),
        "availability": getattr(current_user, 'availability', []),
        "bio": getattr(current_user, 'bio', None),
        "study_habits": getattr(current_user, 'study_habits', []),
        "interests": getattr(current_user, 'interests', []),
        "study_style": getattr(current_user, 'study_style', None),
        "preferred_study_time": getattr(current_user, 'preferred_study_time', None),
        "study_location": getattr(current_user, 'study_location', None),
        "academic_level": getattr(current_user, 'academic_level', None),
        "goals": getattr(current_user, 'goals', [])
    }

# 🔥 MATCHES ENDPOINT - Shows your DB matches!
@router.get("/matches")
async def get_user_matches(current_user: User = Depends(get_current_user)):
    """Get current user's matches from database"""
    print(f"🔍 Fetching matches for {current_user.username}")
    
    matches = await Match.find({
        "$or": [
            {"user1_id": str(current_user.id)},
            {"user2_id": str(current_user.id)}
        ]
    }).to_list()
    
    print(f"Found {len(matches)} raw matches")
    
    result = []
    for match in matches:
        # Get other user ID
        other_id = match.user2_id if match.user1_id == str(current_user.id) else match.user1_id
        
        # Fetch other user details
        other_user = await User.get(other_id)
        if other_user:
            result.append({
                "id": str(match.id),
                "user_id": str(other_user.id),
                "username": other_user.username,
                "email": other_user.email,
                "subjects": getattr(other_user, 'subjects', []),
                "availability": getattr(other_user, 'availability', []),
                "bio": getattr(other_user, 'bio', ''),
                "matched_at": match.matched_at.isoformat() if match.matched_at else None
            })
    
    print(f"✅ Returning {len(result)} formatted matches")
    return result

# 🔥 RECOMMENDATIONS - Users to swipe on
@router.get("/recommendations")
async def get_recommendations(current_user: User = Depends(get_current_user)):
    """Get other users with matching subjects/availability"""
    print(f"🔍 Getting recommendations for {current_user.username}")
    
    if not getattr(current_user, 'profile_completed', False):
        return []
    
    # Find users with overlapping subjects
    pipeline = [
        {"$match": {
            "profile_completed": True,
            "_id": {"$ne": current_user.id}
        }},
        {"$addFields": {
            "common_subjects": {
                "$setIntersection": [
                    "$subjects", 
                    current_user.subjects or []
                ]
            }
        }},
        {"$match": {"common_subjects.0": {"$exists": True}}},
        {"$limit": 20}
    ]
    
    candidates = await User.aggregate(pipeline).to_list()
    
    result = []
    for user in candidates:
        result.append({
            "id": str(user['_id']),
            "username": user['username'],
            "subjects": user.get('subjects', []),
            "availability": user.get('availability', []),
            "bio": user.get('bio', ''),
            "profile_completed": user.get('profile_completed', False)
        })
    
    print(f"✅ {len(result)} recommendations")
    return result

# 🔥 SWIPE ENDPOINT - Creates matches!
@router.post("/swipe")
async def swipe_user(swipe_data: dict, current_user: User = Depends(get_current_user)):
    """Handle swipe right/left + create mutual matches"""
    target_id = swipe_data.get("user_id")
    direction = swipe_data.get("direction")
    
    print(f"👆 {current_user.username} swiped {direction} on {target_id}")
    
    if not target_id:
        raise HTTPException(400, "Missing user_id")
    
    # Create swipe record
    swipe = Swipe(
        swiper_id=str(current_user.id),
        target_id=target_id,
        direction=direction,
        swiped_at=datetime.utcnow()
    )
    await swipe.insert()
    
    if direction == "right":
        # Check mutual swipe
        mutual = await Swipe.find_one({
            "swiper_id": target_id,
            "target_id": str(current_user.id),
            "direction": "right"
        })
        
        if mutual:
            # 🎉 MUTUAL MATCH!
            match = Match(
                user1_id=str(min(current_user.id, ObjectId(target_id))),
                user2_id=str(max(current_user.id, ObjectId(target_id))),
                matched_at=datetime.utcnow()
            )
            await match.insert()
            print(f"🎉 MATCH CREATED: {current_user.username} + {target_id}")
            return {"matched": True, "message": "It's a match! 🎉"}
    
    return {"swiped": True, "direction": direction}
