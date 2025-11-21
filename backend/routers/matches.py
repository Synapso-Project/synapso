from fastapi import APIRouter, Depends, HTTPException, status
from backend.models import User, Match
from backend.routers.users import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/matches", tags=["matches"])

@router.get("/", response_model=List[dict])
async def get_matches(current_user: User = Depends(get_current_user)):
    """Get all matches for the current user"""
    try:
        print(f"Getting matches for user: {current_user.email} (ID: {current_user.id})")
        
        # Find matches where current user is either user1 or user2
        matches = await Match.find(
            {"$or": [
                {"user1_id": str(current_user.id)},
                {"user2_id": str(current_user.id)}
            ]}
        ).to_list()
        
        print(f"Found {len(matches)} matches in database")
        
        result = []
        for match in matches:
            print(f"Processing match: {match.user1_id} <-> {match.user2_id}")
            
            # Get the other user's information
            other_user_id = match.user2_id if match.user1_id == str(current_user.id) else match.user1_id
            
            try:
                other_user = await User.get(other_user_id)
                if other_user:
                    match_data = {
                        "match_id": str(match.id),
                        "user_id": str(other_user.id),
                        "username": other_user.username,
                        "email": other_user.email,
                        "subjects": getattr(other_user, 'subjects', []),
                        "availability": getattr(other_user, 'availability', []),
                        "bio": getattr(other_user, 'bio', ''),
                        "matched_at": match.matched_at if hasattr(match, 'matched_at') else datetime.utcnow()
                    }
                    result.append(match_data)
                    print(f"Added match with user: {other_user.username}")
                else:
                    print(f"User not found: {other_user_id}")
            except Exception as e:
                print(f"Error getting user {other_user_id}: {e}")
        
        print(f"Returning {len(result)} matches")
        return result
        
    except Exception as e:
        print(f"Error fetching matches: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch matches"
        )
