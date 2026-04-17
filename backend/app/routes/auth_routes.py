from fastapi import APIRouter, HTTPException
from app.models.user_model import Login
from app.services.user_service import login_user

router = APIRouter()

@router.post("/login")
def login(data: Login):
    result = login_user(data)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return result