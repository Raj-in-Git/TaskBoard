from fastapi import APIRouter, Depends
from app.models.project_model import Project
from app.services.project_service import *
from app.utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/projects")

# ✅ Get all projects
@router.get("/")
def get_all(user=Depends(get_current_user)):
    return get_projects()


# ✅ Create project
@router.post("/")
def create(project: Project, user=Depends(get_current_user)):
    create_project(project)
    return {"message": "Project created successfully"}


# ✅ Update project
@router.put("/{project_id}")
def update(project_id: int, project: Project, user=Depends(get_current_user)):
    update_project(project_id, project)
    return {"message": "Project updated successfully"}


# ✅ Delete project (Admin only)
@router.delete("/{project_id}")
def delete(project_id: int, admin=Depends(require_admin)):
    return delete_project(project_id)