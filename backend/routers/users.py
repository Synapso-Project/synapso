from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import traceback  # ✅ DEBUG

from models import User
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

# ✅ FIXED: DEBUG JWT Verification
def verify_token(token: str):
    try:
        print(f"🔍 DEBUG: Verifying token: {token[:30]}...")  # First 30 chars
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

# ALL OTHER ROUTES UNCHANGED (copy from your original)...
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

# ... (keep all your other routes exactly the same - update_profile, delete_profile, stats, get_user_public_profile)
