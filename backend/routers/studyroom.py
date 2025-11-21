from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json

router = APIRouter()

class RoomManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.room_users: Dict[str, Set[str]] = {}
        self.room_owners: Dict[str, str] = {}
        self.room_timers: Dict[str, dict] = {}

    async def connect(self, room_id: str, username: str, websocket: WebSocket, is_owner: bool = False):
        await websocket.accept()
        self.active_connections.setdefault(room_id, []).append(websocket)
        self.room_users.setdefault(room_id, set()).add(username)
        # Only set owner if none assigned yet
        if room_id not in self.room_owners:
            self.room_owners[room_id] = username
        if room_id not in self.room_timers:
            self.room_timers[room_id] = {"running": False, "remaining": 1500, "start_time": None}
        await self.broadcast_users(room_id)

    def disconnect(self, room_id: str, username: str, websocket: WebSocket):
        if room_id in self.active_connections:
            try:
                self.active_connections[room_id].remove(websocket)
            except ValueError:
                pass
        if room_id in self.room_users:
            self.room_users[room_id].discard(username)
            if not self.room_users[room_id]:
                # Clean up everything if room is empty
                self.room_users.pop(room_id)
                self.room_timers.pop(room_id, None)
                self.active_connections.pop(room_id, None)
                self.room_owners.pop(room_id, None)
            else:
                # If the owner leaves, assign ownership to next available user
                if self.room_owners.get(room_id) == username:
                    self.room_owners[room_id] = next(iter(self.room_users[room_id]))
                    # Optionally reset timer or keep it going

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

manager = RoomManager()

@router.websocket("/ws/studyroom/{room_id}/{username}")
async def studyroom_ws(websocket: WebSocket, room_id: str, username: str):
    # Only owner if first in the room
    is_owner = False
    if room_id not in manager.room_owners:
        is_owner = True
    await manager.connect(room_id, username, websocket, is_owner=is_owner)
    try:
        await websocket.send_text(json.dumps({"type": "timer_update", "data": manager.room_timers[room_id]}))
        while True:
            msg = await websocket.receive_text()
            obj = json.loads(msg)
            if obj["type"] == "timer_update" and username == manager.room_owners[room_id]:
                manager.room_timers[room_id] = obj["data"]
                await manager.broadcast(room_id, {"type": "timer_update", "data": manager.room_timers[room_id]})
    except WebSocketDisconnect:
        manager.disconnect(room_id, username, websocket)
        await manager.broadcast_users(room_id)
