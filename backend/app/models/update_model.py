from pydantic import BaseModel

class Update(BaseModel):
    taskID: int
    updates: str
    efforts: float