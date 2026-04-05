from pydantic import BaseModel

class Task(BaseModel):
    taskname: str
    details: str
    status: str
    projectid: int