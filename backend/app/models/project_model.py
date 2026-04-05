from pydantic import BaseModel

class Project(BaseModel):
    projectname: str
    description: str | None = None
    status: str = "Active"