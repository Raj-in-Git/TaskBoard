from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import pyodbc
import os
from dotenv import load_dotenv
import datetime
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime
from jose import jwt
from datetime import timedelta
from passlib.context import CryptContext
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)
# Load environment variables
load_dotenv()

app = FastAPI(title="TaskBoard - Backend")

# ✅ Allow frontend (React/HTML) access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database connection
def get_connection():
    conn_str = (
        'DRIVER={ODBC Driver 17 for SQL Server};'
        f'SERVER={os.getenv("DB_SERVER")};'
        f'DATABASE={os.getenv("DB_NAME")};'
        f'UID={os.getenv("DB_USER")};'
        f'PWD={os.getenv("DB_PASSWORD")};'
        'TrustServerCertificate=yes;'
    )
    try:
        return pyodbc.connect(conn_str)
    except Exception as e:
        print("DB CONNECTION ERROR:", e)
        raise


SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

security = HTTPBearer()

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    

def require_admin(user=Depends(get_current_user)):
    if user["roleID"] != 1:   # assuming 1 = Admin
        raise HTTPException(status_code=403, detail="Admin access required")

# Pydantic model for validation
class ProjectModel(BaseModel):
    projectname: str
    description: str | None = None
    status: str = "Active"

# Pydantic model for validation
class Task(BaseModel):
    taskname : str
    details : str
    status : str
    projectid : int

# Pydantic model for validation
class Update(BaseModel):
    taskID : int
    updates : str
    efforts : float

class User(BaseModel):
    username: str
    firstName: str
    lastName: str
    email: EmailStr
    mobileNumber: str
    roleID: int
    password: str   # ✅ ADD THIS
    isActive: Optional[bool] = True

class Login(BaseModel):
    username: str
    password: str

# ✅ Read all projects
@app.get("/projects")
def get_projects(user=Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ProjectID, ProjectName, projectDescription, Status
        FROM Projects
        WHERE Status = 'Active'
        ORDER BY ProjectName
    """)

    rows = cursor.fetchall()

    return [
        {
            "ProjectID": row[0],
            "ProjectName": row[1],
            "Description": row[2],
            "Status": row[3]
        }
        for row in rows
    ]

@app.post("/projects")
def add_project(project: ProjectModel):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO Projects (ProjectName, projectDescription, Status)
            VALUES (?, ?, ?)
        """, project.projectname, project.description, project.status)

        conn.commit()

        return {"message": "Project added successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if conn:
            conn.close()


@app.put("/projects/{project_id}")
def update_project(project_id: int, project: ProjectModel):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE Projects
            SET ProjectName = ?, Description = ?, Status = ?
            WHERE ProjectID = ?
        """, project.projectname, project.description, project.status, project_id)

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Project not found")

        conn.commit()

        return {"message": "Project updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if conn:
            conn.close()

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, user=Depends(require_admin)):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # ✅ Step 1: Check if tasks exist
        cursor.execute(
            "SELECT COUNT(*) FROM Tasks WHERE ProjectID = ?",
            project_id
        )
        task_count = cursor.fetchone()[0]

        # ✅ Step 2: Decide delete type
        if task_count > 0:
            # 🔸 Soft delete
            cursor.execute("""
                UPDATE Projects
                SET Status = 'Inactive'
                WHERE ProjectID = ?
            """, project_id)

            message = "Project has tasks →  ( Project is Inactive)"

        else:
            # 🔸 Hard delete
            cursor.execute("""
                DELETE FROM Projects
                WHERE ProjectID = ?
            """, project_id)

            message = "Project deleted permanently"

        # ✅ Step 3: Check if project exists
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Project not found")

        conn.commit()

        return {
            "message": message,
            "task_count": task_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if conn:
            conn.close()

# ✅ Read all tasks
@app.get("/tasks")
def get_tasks(user=Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                t.taskid,
                t.taskname,
                t.taskdescription,
                t.status,
                t.startdate,
                t.completeddate,
                t.projectid,
                p.ProjectName
            FROM Tasks t
            LEFT JOIN Projects p ON t.ProjectID = p.ProjectID
        """)

        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "taskname": row[1],
                "details": row[2],
                "status": row[3],
                "created_at": row[4],
                "updated_at": row[5],
                "projectname": row[7],
                "projectid": row[6]
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:   # ✅ prevents crash
            conn.close()

@app.get("/tasks/active")
def active_tasks():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("select count(taskname) from tasks where status = 'Active';")
        rows = cursor.fetchall()
        result = ''
        for row in rows:
            result = row[0]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/tasks/active/name")
def active_tasks():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("select taskID, taskname from tasks where status = 'Active';")
        rows = cursor.fetchall()
        result = []
        for row in rows:
            result.append({
                "taskID": row[0],
                "taskname": row[1]
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ✅ Create (Insert) task
@app.post("/tasks")
def create_task(task: Task):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.datetime.now()
        query = """
        INSERT INTO tasks (taskname, taskdescription, startDate, completeddate, status, ProjectID)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (task.taskname, task.details, now, now,"Active",task.projectid))
        conn.commit()
        return {"message": "Task inserted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ✅ Update task
@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: Task):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.datetime.now()

        query = """
        UPDATE tasks
        SET taskname = ?, 
            details = ?, 
            updated_at = ?, 
            status = ?, 
            projectid = ?
        WHERE id = ?
        """

        cursor.execute(query, (
            task.taskname,
            task.details,
            now,
            task.status,
            task.projectid,  # ✅ update projectid
            task_id          # ✅ only filter by id
        ))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found")

        conn.commit()

        return {"message": "Task updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if conn:
            conn.close()

# ✅ Delete task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/getUpdates")
def get_updates():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                u.updateID,
                u.updates,
                u.efforts,
                u.updateDate,
                u.taskID,
                t.taskname,
                t.projectID,
                p.projectname
            FROM Updates u
            LEFT JOIN Tasks t ON u.taskID = t.taskID
            LEFT JOIN Projects p ON t.projectID = p.projectID
            ORDER BY u.updateDate DESC
            """
        cursor.execute(query)
        rows = cursor.fetchall()
        result = []
        for row in rows:
            result.append({
                "id": row[0],
                "Updated_Time": row[3],
                "Project_Name": row[7],
                "Task_Name": row[5],
                "Update": row[1],
                "Efforts": row[2]
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ✅ Create (Insert) task
@app.post("/addUpdates")
def add_updates(task: Update):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.datetime.now()
        query = """
        INSERT INTO Updates (taskID, updates, efforts, updateDate)
        VALUES (?, ?, ?, GETDATE())
        """

        cursor.execute(query, (
            task.taskID,
            task.updates,
            task.efforts
        ))

        conn.commit()

        return {"message": "Update added successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if conn:
            conn.close()

# ✅ Update updates
@app.put("/editUpdates/{update_id}")
def edit_updates(update_id: int, task: Update):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.datetime.now()
        query = """
        UPDATE updates
        SET taskID = ?, updates = ?, efforts = ?
        WHERE updateID = ?
        """
        cursor.execute(query, (task.taskID, task.updates, task.efforts, update_id))
        conn.commit()
        return {"message": "Task updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ✅ Delete task
@app.delete("/deleteUpdates/{update_id}")
def delete_updates(update_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM updates WHERE id = ?", (update_id,))
        conn.commit()
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/users")
def get_users():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT u.*, r.roleName 
        FROM Users u
        LEFT JOIN Roles r ON u.roleID = r.roleID
    """)

    columns = [col[0] for col in cursor.description]

    data = [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

    conn.close()
    return data

@app.post("/users")
def create_user(user: User, current=Depends(require_admin)):
    conn = get_connection()
    cursor = conn.cursor()

    hashed_pwd = hash_password(user.password)

    cursor.execute("""
        INSERT INTO Users (username, firstName, lastName, email, mobileNumber, roleID, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user.username,
        user.firstName,
        user.lastName,
        user.email,
        user.mobileNumber,
        user.roleID,
        hashed_pwd
    ))

    conn.commit()
    conn.close()

    return {"message": "User created"}

@app.put("/users/{user_id}")
def update_user(user_id: int, user: User):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE Users
        SET username=?, firstName=?, lastName=?, email=?, mobileNumber=?, roleID=?
        WHERE userID=?
    """, (
        user.username,
        user.firstName,
        user.lastName,
        user.email,
        user.mobileNumber,
        user.roleID,
        user_id
    ))

    conn.commit()
    conn.close()

    return {"message": "User updated"}

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM Users WHERE userID=?", user_id)

    conn.commit()
    conn.close()

    return {"message": "User deleted"}

@app.post("/login")
def login(data: Login):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT userID, username, password, roleID
        FROM Users
        WHERE username = ?
    """, data.username)

    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username")

    user_id, username, hashed_password, roleID = user

    # ✅ Verify password
    if not verify_password(data.password, hashed_password):
        raise HTTPException(status_code=401, detail="Invalid password")

    # ✅ Create JWT token
    token = create_token({
        "user_id": user_id,
        "username": username,
        "roleID": roleID
    })

    return {
        "access_token": token,
        "roleID": roleID
    }