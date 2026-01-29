from fastapi import APIRouter, Depends, HTTPException, status
from backend.models import User, Swipe, Match
from backend.routers.users import get_current_user
#from backend.users import get_current_user
from backend.schemas import SwipeInput
from typing import List
from datetime import datetime
import traceback

router = APIRouter(prefix="/swipes", tags=["swipes"])

@router.get("/recommendations", response_model=List[dict])
async def get_recommendations(current_user: User = Depends(get_current_user)):
    """Get user recommendations for swiping"""
    try:
        print(f"Getting recommendations for user: {current_user.email}")
        
        # Get all swipes by current user to find who they've already swiped on
        user_swipes = await Swipe.find({"swiper_id": str(current_user.id)}).to_list()
        swiped_user_ids = [swipe.swipee_id for swipe in user_swipes]
        
        print(f"Already swiped user IDs: {swiped_user_ids}")
        
        # Exclude current user and already swiped users
        exclude_ids = [str(current_user.id)] + swiped_user_ids
        
        # Convert string IDs to ObjectIds for MongoDB query
        from bson import ObjectId
        exclude_object_ids = []
        for id_str in exclude_ids:
            try:
                exclude_object_ids.append(ObjectId(id_str))
            except:
                pass  # Skip invalid IDs
        
        print(f"Excluding object IDs: {exclude_object_ids}")
        
        # Get other users - FIXED: Use limit() before to_list()
        users = await User.find({"_id": {"$nin": exclude_object_ids}}).limit(10).to_list()
        
        print(f"Found {len(users)} potential matches")
        
        # Convert to dict format
        recommendations = []
        for user in users:
            user_dict = {
                "id": str(user.id),
                "_id": str(user.id),
                "username": user.username,
                "email": user.email,
                "subjects": getattr(user, 'subjects', []),
                "availability": getattr(user, 'availability', []),
                "studyHabits": getattr(user, 'study_habits', []),
                "interests": getattr(user, 'interests', []),
                "bio": getattr(user, 'bio', ''),
                "academicLevel": getattr(user, 'academic_level', ''),
                "studyLocation": getattr(user, 'study_location', ''),
                "preferredStudyTime": getattr(user, 'preferred_study_time', '')
            }
            recommendations.append(user_dict)
            print(f"Added recommendation: {user_dict['username']}")
        
        print(f"Returning {len(recommendations)} recommendations")
        return recommendations
        
    except Exception as e:
        print(f"Error fetching recommendations: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recommendations"
        )

@router.post("/")
async def create_swipe(swipe_data: SwipeInput, current_user: User = Depends(get_current_user)):
    """Create a new swipe and check for matches"""
    try:
        print(f"User {current_user.email} swiping {swipe_data.direction} on {swipe_data.swipee_id}")
        
        # Check if already swiped
        existing = await Swipe.find_one({
            "swiper_id": str(current_user.id),
            "swipee_id": swipe_data.swipee_id
        })
        
        if existing:
            return {"success": False, "message": "Already swiped"}
        
        # Create swipe
        swipe = Swipe(
            swiper_id=str(current_user.id),
            swipee_id=swipe_data.swipee_id,
            direction=swipe_data.direction,
            swiped_at=datetime.utcnow()
        )
        await swipe.insert()
        print(f"Swipe created: {swipe.id}")
        
        # Check for match on right swipe
        is_match = False
        if swipe_data.direction == "right":
            print("Checking for mutual swipe...")
            mutual_swipe = await Swipe.find_one({
                "swiper_id": swipe_data.swipee_id,
                "swipee_id": str(current_user.id),
                "direction": "right"
            })
            
            if mutual_swipe:
                print("Mutual swipe found! Creating match...")
                # Check if match exists
                existing_match = await Match.find_one({
                    "$or": [
                        {"user1_id": str(current_user.id), "user2_id": swipe_data.swipee_id},
                        {"user1_id": swipe_data.swipee_id, "user2_id": str(current_user.id)}
                    ]
                })
                
                if not existing_match:
                    match = Match(
                        user1_id=str(current_user.id),
                        user2_id=swipe_data.swipee_id,
                        matched_at=datetime.utcnow()
                    )
                    await match.insert()
                    print(f"Match created: {match.id}")
                
                is_match = True
        
        return {
            "success": True,
            "swipe_id": str(swipe.id),
            "is_match": is_match,
            "message": "It's a match! 🎉" if is_match else "Swipe recorded"
        }
        
    except Exception as e:
        print(f"Error creating swipe: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create swipe: {str(e)}"
        )

