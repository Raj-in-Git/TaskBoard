from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
from app.core.security import SECRET_KEY, ALGORITHM

security = HTTPBearer()

def get_current_user(credentials=Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except:
        raise HTTPException(401, "Invalid token")

def require_admin(user=Depends(get_current_user)):
    if user["roleID"] != 1:
        raise HTTPException(403, "Admin only")