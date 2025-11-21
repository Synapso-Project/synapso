from fastapi import APIRouter, Depends, HTTPException, status
from backend.models import User, Match, Message, Chat
from backend.routers.users import get_current_user
from typing import List
from datetime import datetime
from pydantic import BaseModel
import traceback

router = APIRouter(prefix="/messages", tags=["messages"])

# ---- Schemas ----
class MessageCreate(BaseModel):
    match_id: str
    content: str

class MessageResponse(BaseModel):
    id: str
    match_id: str
    sender_id: str
    sender_username: str
    receiver_id: str
    content: str
    sent_at: datetime
    is_read: bool

class ChatResponse(BaseModel):
    id: str
    match_id: str
    other_user_id: str
    other_user_username: str
    last_message: str
    last_message_at: datetime
    unread_count: int

# ---- Endpoints ----

@router.get("/chats", response_model=List[ChatResponse])
async def get_user_chats(current_user: User = Depends(get_current_user)):
    """Get all chats for the current user"""
    try:
        print(f"\n=== GET CHATS ===")
        print(f"User: {current_user.email} (ID: {current_user.id})")
        
        # Get all matches for current user
        matches = await Match.find({
            "$or": [
                {"user1_id": str(current_user.id)},
                {"user2_id": str(current_user.id)}
            ]
        }).to_list()

        print(f"Found {len(matches)} matches")

        chats = []
        for match in matches:
            try:
                # Get other user
                other_user_id = match.user2_id if match.user1_id == str(current_user.id) else match.user1_id
                print(f"\nProcessing match {match.id}")
                print(f"Other user ID: {other_user_id}")
                
                other_user = await User.get(other_user_id)
                
                if not other_user:
                    print(f"⚠️ User not found: {other_user_id}")
                    continue

                print(f"Other user: {other_user.username}")

                # Get last message for this match
                last_messages = await Message.find(
                    {"match_id": str(match.id)}
                ).sort(-Message.sent_at).limit(1).to_list()

                print(f"Messages found: {len(last_messages)}")

                # Count unread messages
                unread_count = await Message.find({
                    "match_id": str(match.id),
                    "receiver_id": str(current_user.id),
                    "is_read": False
                }).count()

                print(f"Unread count: {unread_count}")

                # Determine last message and time
                if last_messages and len(last_messages) > 0:
                    last_message_text = last_messages[0].content
                    last_message_time = last_messages[0].sent_at
                    print(f"Last message: '{last_message_text}' at {last_message_time}")
                else:
                    last_message_text = "Start a conversation!"
                    # Use matched_at if it exists, otherwise current time
                    if hasattr(match, 'matched_at') and match.matched_at:
                        last_message_time = match.matched_at
                    else:
                        last_message_time = datetime.utcnow()
                    print(f"No messages yet, using time: {last_message_time}")

                chat_data = ChatResponse(
                    id=str(match.id),
                    match_id=str(match.id),
                    other_user_id=str(other_user.id),
                    other_user_username=other_user.username,
                    last_message=last_message_text,
                    last_message_at=last_message_time,
                    unread_count=unread_count
                )
                chats.append(chat_data)
                print(f"✅ Added chat with {other_user.username}")
                
            except Exception as e:
                print(f"❌ Error processing match {match.id}: {e}")
                traceback.print_exc()
                continue

        # Sort by last message time
        chats.sort(key=lambda x: x.last_message_at, reverse=True)
        
        print(f"\n=== RETURNING {len(chats)} CHATS ===\n")
        return chats

    except Exception as e:
        print(f"❌ Error fetching chats: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/{match_id}", response_model=List[MessageResponse])
async def get_chat_messages(match_id: str, current_user: User = Depends(get_current_user)):
    """Get all messages for a specific chat"""
    try:
        print(f"\n=== GET CHAT MESSAGES ===")
        print(f"Match ID: {match_id}")
        print(f"User: {current_user.email}")
        
        # Verify user is part of this match
        match = await Match.get(match_id)
        if not match or (str(current_user.id) not in [match.user1_id, match.user2_id]):
            print(f"❌ User not authorized for match {match_id}")
            raise HTTPException(status_code=403, detail="Not authorized to view this chat")

        print(f"✅ User authorized")

        # Get messages
        messages = await Message.find({"match_id": match_id}).sort(Message.sent_at).to_list()
        
        print(f"Found {len(messages)} messages")
        
        # Mark messages as read
        unread_messages = await Message.find({
            "match_id": match_id,
            "receiver_id": str(current_user.id),
            "is_read": False
        }).to_list()
        
        if unread_messages:
            print(f"Marking {len(unread_messages)} messages as read")
            for msg in unread_messages:
                msg.is_read = True
                msg.read_at = datetime.utcnow()
                await msg.save()

        # Format response
        response = []
        for msg in messages:
            sender = await User.get(msg.sender_id)
            response.append(MessageResponse(
                id=str(msg.id),
                match_id=msg.match_id,
                sender_id=msg.sender_id,
                sender_username=sender.username if sender else "Unknown",
                receiver_id=msg.receiver_id,
                content=msg.content,
                sent_at=msg.sent_at,
                is_read=msg.is_read
            ))

        print(f"=== RETURNING {len(response)} MESSAGES ===\n")
        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching messages: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send", response_model=MessageResponse)
async def send_message(message_data: MessageCreate, current_user: User = Depends(get_current_user)):
    """Send a message to a match"""
    try:
        print(f"\n=== SEND MESSAGE ===")
        print(f"User: {current_user.email}")
        print(f"Match ID: {message_data.match_id}")
        print(f"Content: {message_data.content}")
        
        # Verify match exists and user is part of it
        match = await Match.get(message_data.match_id)
        if not match or (str(current_user.id) not in [match.user1_id, match.user2_id]):
            print(f"❌ User not authorized for match {message_data.match_id}")
            raise HTTPException(status_code=403, detail="Not authorized to send message to this chat")

        # Get receiver
        receiver_id = match.user2_id if match.user1_id == str(current_user.id) else match.user1_id
        print(f"Receiver ID: {receiver_id}")
        
        # Create message
        message = Message(
            match_id=message_data.match_id,
            sender_id=str(current_user.id),
            receiver_id=receiver_id,
            content=message_data.content,
            sent_at=datetime.utcnow()
        )
        await message.insert()

        print(f"✅ Message sent: {message.id}")
        print(f"=== MESSAGE SENT ===\n")

        return MessageResponse(
            id=str(message.id),
            match_id=message.match_id,
            sender_id=message.sender_id,
            sender_username=current_user.username,
            receiver_id=message.receiver_id,
            content=message.content,
            sent_at=message.sent_at,
            is_read=message.is_read
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
