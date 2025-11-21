from fastapi import APIRouter, Depends
from backend.services.auth import get_current_user

router = APIRouter()

@router.get("/my")
async def my_groups(current_user: dict = Depends(get_current_user)):
    # TODO: expand later to real study groups
    return {"groups": []}
