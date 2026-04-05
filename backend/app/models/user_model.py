from pydantic import BaseModel, EmailStr

class User(BaseModel):
    username: str
    firstName: str
    lastName: str
    email: EmailStr
    mobileNumber: str
    roleID: int
    password: str

class Login(BaseModel):
    username: str
    password: str