from fastapi import APIRouter, Depends
from app.models.user_model import User
from app.services.user_service import create_user
from app.utils.dependencies import require_admin

router = APIRouter(prefix="/users")

@router.post("/")
def create(user: User, admin=Depends(require_admin)):
    create_user(user)
    return {"message": "User created"}