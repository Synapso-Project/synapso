from beanie import Document
from typing import List, Optional
from datetime import datetime

# ---------- User Collection ----------
class User(Document):
    username: str
    email: str
    password: str  # hashed password stored here
    subjects: List[str] = []
    availability: List[str] = []
    
    # Extended profile fields
    bio: Optional[str] = None
    study_habits: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    study_style: Optional[str] = None
    preferred_study_time: Optional[str] = None
    study_location: Optional[str] = None
    academic_level: Optional[str] = None
    goals: Optional[List[str]] = []

    class Settings:
        name = "users"

# ---------- Match Collection ----------
class Match(Document):
    user1_id: str
    user2_id: str
    matched_at: Optional[datetime] = None

    class Settings:
        name = "matches"

# ---------- Group Collection ----------
class Group(Document):
    name: str
    member_ids: List[str]
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    class Settings:
        name = "groups"

# ---------- Swipe Collection ----------
class Swipe(Document):
    swiper_id: str  # Changed from 'from_user' to 'swiper_id'
    swipee_id: str  # Changed from 'to_user' to 'swipee_id'  
    direction: str  # "left" or "right"
    swiped_at: Optional[datetime] = None  # Added timestamp

    class Settings:
        name = "swipes"

# ---------- Message Collection ----------
class Message(Document):
    match_id: str  # Reference to the match
    sender_id: str  # Who sent the message
    receiver_id: str  # Who receives the message
    content: str  # Message text
    message_type: str = "text"  # text, image, etc.
    sent_at: datetime = datetime.utcnow()
    read_at: Optional[datetime] = None
    is_read: bool = False

    class Settings:
        name = "messages"

# ---------- Chat/Conversation Collection ----------
class Chat(Document):
    match_id: str  # Reference to the match
    participants: List[str]  # [user1_id, user2_id]
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
    is_active: bool = True

    class Settings:
        name = "chats"