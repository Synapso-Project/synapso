from typing import List
from backend.models import User, Swipe, Match
from bson import ObjectId

def _overlap(a: list, b: list) -> int:
    return len(set([x.strip().lower() for x in a]) & set([y.strip().lower() for y in b]))

async def suggested_users_for(user: User, limit: int = 10) -> List[User]:
    # Users already swiped
    swiped_ids = set()
    async for sw in Swipe.find(Swipe.from_user == str(user.id)):
        swiped_ids.add(sw.to_user)

    candidates = []
    async for u in User.find():
        if str(u.id) == str(user.id) or str(u.id) in swiped_ids:
            continue
        score = _overlap(user.subjects, u.subjects) * 2 + _overlap(user.availability, u.availability)
        if score > 0:
            candidates.append((score, u))

    candidates.sort(key=lambda t: t[0], reverse=True)
    return [u for _, u in candidates[:limit]]

async def record_swipe(from_user_id: str, to_user_id: str, direction: str) -> bool:
    if direction not in ("left", "right"):
        raise ValueError("direction must be 'left' or 'right'")

    # Record swipe
    swipe = await Swipe.find_one({"from_user": from_user_id, "to_user": to_user_id})
    if swipe:
        swipe.direction = direction
        await swipe.save()
    else:
        swipe = Swipe(from_user=from_user_id, to_user=to_user_id, direction=direction)
        await swipe.insert()

    # Check for mutual right swipe
    if direction == "right":
        reciprocal = await Swipe.find_one({"from_user": to_user_id, "to_user": from_user_id, "direction": "right"})
        if reciprocal:
            # Create match if not exists
            existing_match = await Match.find_one(
                {"user1_id": {"$in": [from_user_id, to_user_id]},
                 "user2_id": {"$in": [from_user_id, to_user_id]}}
            )
            if not existing_match:
                match = Match(user1_id=from_user_id, user2_id=to_user_id)
                await match.insert()
            return True
    return False
