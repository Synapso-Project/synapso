from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.models import User
#from backend.config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from backend.schemas import UserCreate, UserLogin, UserPublic, TokenResponse, UserProfileUpdate, ProfileUpdateResponse
#from config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
#from backend.config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from ..config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
router = APIRouter(prefix="/users", tags=["users"])

# ---------- Password Hashing ----------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------- Authentication ----------
security = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

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
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_id = verify_token(token)
    user = await User.get(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

# ---------- Routes ----------
@router.post("/signup", response_model=UserPublic)
async def signup(user: UserCreate):
    # check if user already exists
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

    # create JWT token
    token_data = {"sub": str(db_user.id), "email": db_user.email}
    access_token = create_access_token(token_data)

    # Return user data with token
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

    return TokenResponse(
        access_token=access_token,
        user=user_data
    )

@router.get("/profile", response_model=UserPublic)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
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

@router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update user profile with study preferences"""
    try:
        # Prepare update data - only include fields that are provided and not empty
        update_data = {}
        
        # Map frontend fields to backend fields and filter out empty values
        field_mapping = {
            "subjects": "subjects",
            "availability": "availability", 
            "study_habits": "study_habits",
            "interests": "interests",
            "bio": "bio",
            "study_style": "study_style",
            "preferred_study_time": "preferred_study_time",
            "study_location": "study_location",
            "academic_level": "academic_level",
            "goals": "goals"
        }
        
        # Process each field
        for frontend_field, backend_field in field_mapping.items():
            if frontend_field in profile_data:
                value = profile_data[frontend_field]
                # Only update fields with meaningful values
                if value is not None and value != "" and value != [] and value != "null":
                    # Handle string "null" values from frontend
                    if isinstance(value, str) and value.lower() == "null":
                        continue
                    update_data[backend_field] = value
        
        print(f"Updating user {current_user.id} with data: {update_data}")
        
        # Update the user document
        if update_data:
            await current_user.update({"$set": update_data})
            print(f"Successfully updated user profile with fields: {list(update_data.keys())}")
        else:
            print("No valid fields to update")
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "updated_fields": list(update_data.keys()),
            "profile_data": update_data
        }
        
    except Exception as e:
        print(f"Error updating profile: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
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

@router.delete("/profile")
async def delete_profile(current_user: User = Depends(get_current_user)):
    """Delete user account"""
    try:
        await current_user.delete()
        return {"success": True, "message": "Account deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )

@router.get("/stats")
async def get_user_stats(current_user: User = Depends(get_current_user)):
    """Get user activity statistics"""
    try:
        # Calculate profile completion percentage
        profile_fields = ['subjects', 'availability', 'bio', 'study_habits', 'interests', 
                         'study_style', 'preferred_study_time', 'study_location', 'academic_level']
        
        completed_fields = 0
        for field in profile_fields:
            value = getattr(current_user, field, None)
            if value and (not isinstance(value, list) or len(value) > 0):
                completed_fields += 1
        
        profile_completion = int((completed_fields / len(profile_fields)) * 100)
        
        return {
            "profile_completion": profile_completion,
            "total_fields": len(profile_fields),
            "completed_fields": completed_fields,
            "missing_fields": [field for field in profile_fields 
                             if not getattr(current_user, field, None) or 
                             (isinstance(getattr(current_user, field, None), list) and 
                              len(getattr(current_user, field, [])) == 0)]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user stats: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserPublic)
async def get_user_public_profile(user_id: str):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Optionally: restrict fields if needed (don't return password)
    return UserPublic(
        id=str(user.id),
        username=user.username,
        email=user.email,
        subjects=getattr(user, 'subjects', []),
        availability=getattr(user, 'availability', []),
        bio=getattr(user, 'bio', None),
        study_habits=getattr(user, 'study_habits', []),
        interests=getattr(user, 'interests', []),
        study_style=getattr(user, 'study_style', None),
        preferred_study_time=getattr(user, 'preferred_study_time', None),
        study_location=getattr(user, 'study_location', None),
        academic_level=getattr(user, 'academic_level', None),
        goals=getattr(user, 'goals', [])
    )
