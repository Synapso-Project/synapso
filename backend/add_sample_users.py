import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.models import User
from backend.config import MONGO_URI, MONGO_DB
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def add_sample_users():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    await init_beanie(database=db, document_models=[User])
    
    sample_users = [
        {
            "username": "John Smith",
            "email": "john@example.com",
            "password": pwd_context.hash("password123"),
            "subjects": ["Computer Science", "Mathematics"],
            "availability": ["Mon 18-20", "Wed 16-18", "Fri 14-16"]
        },
        {
            "username": "Sarah Johnson",
            "email": "sarah@example.com", 
            "password": pwd_context.hash("password123"),
            "subjects": ["Biology", "Chemistry", "Physics"],
            "availability": ["Tue 17-19", "Thu 15-17", "Sat 10-12"]
        },
        {
            "username": "Mike Davis",
            "email": "mike@example.com",
            "password": pwd_context.hash("password123"),
            "subjects": ["History", "English", "Philosophy"],
            "availability": ["Mon 14-16", "Wed 18-20", "Sun 16-18"]
        },
        {
            "username": "Emma Wilson",
            "email": "emma@example.com",
            "password": pwd_context.hash("password123"),
            "subjects": ["Psychology", "Sociology", "Statistics"],
            "availability": ["Tue 16-18", "Thu 14-16", "Sat 12-14"]
        }
    ]
    
    for user_data in sample_users:
        existing_user = await User.find_one({"email": user_data["email"]})
        if not existing_user:
            user = User(**user_data)
            await user.insert()
            print(f"Created user: {user_data['username']}")
        else:
            print(f"User already exists: {user_data['username']}")

if __name__ == "__main__":
    asyncio.run(add_sample_users())
