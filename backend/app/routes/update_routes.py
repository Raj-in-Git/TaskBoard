from fastapi import APIRouter, Depends
from app.models.update_model import Update
from app.services.update_service import *
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/updates")

@router.get("/")
def get_all(user=Depends(get_current_user)):
    return get_updates()

@router.post("/")
def create(data: Update, user=Depends(get_current_user)):
    create_update(data)
    return {"message": "Update created"}

@router.put("/{update_id}")
def update(update_id: int, data: Update, user=Depends(get_current_user)):
    update_update(update_id, data)
    return {"message": "Update updated"}

@router.delete("/{update_id}")
def delete(update_id: int, user=Depends(get_current_user)):
    delete_update(update_id)
    return {"message": "Update deleted"}