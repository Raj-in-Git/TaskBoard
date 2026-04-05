from fastapi import APIRouter
from app.models.user_model import Login
from app.services.user_service import login_user

router = APIRouter()

@router.post("/login")
def login(data: Login):
    return login_user(data)