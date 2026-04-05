from fastapi import APIRouter, Depends
from app.models.task_model import Task
from app.services.task_service import *
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/tasks")

@router.get("/")
def get_all(user=Depends(get_current_user)):
    return get_tasks()

@router.post("/")
def create(task: Task, user=Depends(get_current_user)):
    create_task(task)
    return {"message": "Task created"}

@router.put("/{task_id}")
def update(task_id: int, task: Task, user=Depends(get_current_user)):
    update_task(task_id, task)
    return {"message": "Task updated"}

@router.delete("/{task_id}")
def delete(task_id: int, user=Depends(get_current_user)):
    delete_task(task_id)
    return {"message": "Task deleted"}