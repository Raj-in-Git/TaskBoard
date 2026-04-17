from jose import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_token(data: dict):
    to_encode = data.copy()  # ✅ avoid modifying original
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=60)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)