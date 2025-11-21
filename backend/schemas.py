from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# ---------- Base User ----------
class UserBase(BaseModel):
    username: str
    email: EmailStr
    subjects: List[str] = []
    availability: List[str] = []

# ---------- User Schemas ----------
class UserCreate(UserBase):
    password: str  # required only for signup

class UserPublic(UserBase):
    id: str  # returned in responses, never includes password
    # Extended profile fields
    bio: Optional[str] = None
    study_habits: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    study_style: Optional[str] = None
    preferred_study_time: Optional[str] = None
    study_location: Optional[str] = None
    academic_level: Optional[str] = None
    goals: Optional[List[str]] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    """Schema for profile updates"""
    subjects: Optional[List[str]] = None
    availability: Optional[List[str]] = None
    bio: Optional[str] = None
    study_habits: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    study_style: Optional[str] = None
    preferred_study_time: Optional[str] = None
    study_location: Optional[str] = None
    academic_level: Optional[str] = None
    goals: Optional[List[str]] = None

# ---------- Token Response ----------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserPublic] = None

# ---------- Swipe ----------
class SwipeInput(BaseModel):
    swipee_id: str
    direction: str  # "left", "right", or "super"

class SwipeResponse(BaseModel):
    success: bool
    swipe_id: str
    is_match: bool = False
    message: Optional[str] = None

# ---------- Match ----------
class MatchPublic(BaseModel):
    id: str
    user1_id: str
    user2_id: str
    matched_at: Optional[datetime] = None
    
class MatchWithUser(BaseModel):
    """Match with other user's information"""
    match_id: str
    user_id: str
    username: str
    email: str
    subjects: List[str] = []
    availability: List[str] = []
    bio: Optional[str] = None
    study_habits: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    matched_at: Optional[datetime] = None

# ---------- Recommendations ----------
class UserRecommendation(BaseModel):
    """User data for recommendations/swiping"""
    id: str
    _id: str  # MongoDB ObjectId as string
    username: str
    email: str
    subjects: List[str] = []
    availability: List[str] = []
    bio: Optional[str] = None
    study_habits: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    study_style: Optional[str] = None
    preferred_study_time: Optional[str] = None
    study_location: Optional[str] = None
    academic_level: Optional[str] = None
    goals: Optional[List[str]] = []

# ---------- Group ----------
class GroupPublic(BaseModel):
    id: str
    name: str
    member_ids: List[str]
    description: Optional[str] = None
    subjects: Optional[List[str]] = []
    created_at: Optional[datetime] = None

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    subjects: Optional[List[str]] = []

# ---------- Profile Summary ----------
class ProfileSummary(BaseModel):
    """Compact profile info for cards/lists"""
    id: str
    username: str
    subjects: List[str] = []
    availability: List[str] = []
    bio: Optional[str] = None
    academic_level: Optional[str] = None
    compatibility_score: Optional[int] = None

# ---------- API Response Schemas ----------
class SuccessResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None

class ProfileUpdateResponse(BaseModel):
    success: bool
    message: str
    updated_fields: List[str]
    profile_data: dict

# ---------- Statistics ----------
class UserStats(BaseModel):
    """User activity statistics"""
    total_swipes: int = 0
    right_swipes: int = 0
    left_swipes: int = 0
    matches: int = 0
    profile_completion: int = 0  # percentage

# ---------- Search/Filter ----------
class UserSearchFilter(BaseModel):
    """Filters for user search"""
    subjects: Optional[List[str]] = None
    academic_level: Optional[str] = None
    study_location: Optional[str] = None
    availability: Optional[List[str]] = None
    min_compatibility: Optional[int] = None

# ---------- Notification ----------
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str  # "match", "message", "system"

class NotificationPublic(NotificationBase):
    id: str
    user_id: str
    read: bool = False
    created_at: Optional[datetime] = None
