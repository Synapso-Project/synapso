from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json
from datetime import datetime

router = APIRouter()

class RoomManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.room_users: Dict[str, Set[str]] = {}
        self.room_owners: Dict[str, str] = {}
        self.room_timers: Dict[str, dict] = {}
        self.room_messages: Dict[str, List[dict]] = {}  # NEW: Store chat messages

    async def connect(self, room_id: str, username: str, websocket: WebSocket, is_owner: bool = False):
        await websocket.accept()
        self.active_connections.setdefault(room_id, []).append(websocket)
        self.room_users.setdefault(room_id, set()).add(username)
        if room_id not in self.room_owners:
            self.room_owners[room_id] = username
        if room_id not in self.room_timers:
            self.room_timers[room_id] = {"running": False, "remaining": 1500, "start_time": None}
        if room_id not in self.room_messages:
            self.room_messages[room_id] = []
        
        await self.broadcast_users(room_id)
        # Send previous messages to new user
        await websocket.send_text(json.dumps({
            "type": "chat_history",
            "messages": self.room_messages[room_id]
        }))

    def disconnect(self, room_id: str, username: str, websocket: WebSocket):
        if room_id in self.active_connections:
            try:
                self.active_connections[room_id].remove(websocket)
            except ValueError:
                pass
        if room_id in self.room_users:
            self.room_users[room_id].discard(username)
            if not self.room_users[room_id]:
                self.room_users.pop(room_id)
                self.room_timers.pop(room_id, None)
                self.active_connections.pop(room_id, None)
                self.room_owners.pop(room_id, None)
                self.room_messages.pop(room_id, None)  # Clear messages when room empty
            else:
                if self.room_owners.get(room_id) == username:
                    self.room_owners[room_id] = next(iter(self.room_users[room_id]))

    async def broadcast_users(self, room_id: str):
        if room_id in self.active_connections:
            users = list(self.room_users[room_id])
            await self.broadcast(room_id, {
                "type": "user_list",
                "users": users,
                "owner": self.room_owners[room_id]
            })

    async def broadcast(self, room_id: str, message: dict):
        for conn in self.active_connections.get(room_id, []):
            await conn.send_text(json.dumps(message))

    async def broadcast_chat(self, room_id: str, username: str, message: str):
        """NEW: Broadcast chat message"""
        chat_msg = {
            "type": "chat_message",
            "username": username,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self.room_messages[room_id].append(chat_msg)
        await self.broadcast(room_id, chat_msg)

manager = RoomManager()

@router.websocket("/ws/studyroom/{room_id}/{username}")
async def studyroom_ws(websocket: WebSocket, room_id: str, username: str):
    is_owner = False
    if room_id not in manager.room_owners:
        is_owner = True
    await manager.connect(room_id, username, websocket, is_owner=is_owner)
    try:
        await websocket.send_text(json.dumps({
            "type": "timer_update",
            "data": manager.room_timers[room_id]
        }))
        while True:
            msg = await websocket.receive_text()
            obj = json.loads(msg)
            
            if obj["type"] == "timer_update" and username == manager.room_owners[room_id]:
                manager.room_timers[room_id] = obj["data"]
                await manager.broadcast(room_id, {
                    "type": "timer_update",
                    "data": manager.room_timers[room_id]
                })
            
            # NEW: Handle chat messages
            elif obj["type"] == "chat_message":
                await manager.broadcast_chat(room_id, username, obj["message"])
                
    except WebSocketDisconnect:
        manager.disconnect(room_id, username, websocket)
        await manager.broadcast_users(room_id)
