from fastapi import APIRouter, Depends
from app.models.user_model import User
from app.services.user_service import create_user
from app.utils.dependencies import require_admin
from fastapi import HTTPException

router = APIRouter(prefix="/users")

@router.post("/", status_code=201)
def create(user: User, admin=Depends(require_admin)):
    try:
        create_user(user)
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
