from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
from app.core.security import SECRET_KEY, ALGORITHM

security = HTTPBearer()

# 🔥 Role Mapping (based on your DB roleID)
ROLE_MAP = {
    1: "Admin",
    2: "Manager",
    3: "Team Lead",
    4: "Team Member"
}

# 🔥 Permissions
ROLE_PERMISSIONS = {
    "Admin": ["projects", "tasks", "efforts"],
    "Manager": ["projects", "tasks", "efforts"],
    "Team Lead": ["tasks", "efforts"],
    "Team Member": ["efforts"]
}


# 🔐 Get current user
def get_current_user(credentials=Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # contains roleID
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


# 🔥 Generic RBAC function
def authorize(required_modules: list):
    def wrapper(user=Depends(get_current_user)):
        role_id = user.get("roleID")

        role_name = ROLE_MAP.get(role_id)

        if not role_name:
            raise HTTPException(status_code=403, detail="Invalid role")

        allowed_modules = ROLE_PERMISSIONS.get(role_name, [])

        if not any(module in allowed_modules for module in required_modules):
            raise HTTPException(status_code=403, detail="Access Denied")

        return user

    return wrapper


# ✅ Keep your admin check (optional)
def require_admin(user=Depends(get_current_user)):
    if user.get("roleID") != 1:
        raise HTTPException(status_code=403, detail="Admin only")
    return user