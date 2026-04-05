from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    auth_routes,
    user_routes,
    project_routes,
    task_routes,
    update_routes
)

app = FastAPI(title="TaskBoard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(project_routes.router)
app.include_router(task_routes.router)
app.include_router(update_routes.router)


@app.on_event("startup")
def create_default_admin():
    from app.db.database import get_connection
    from app.core.security import hash_password

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM Users WHERE username='admin'")
    exists = cursor.fetchone()[0]

    if exists == 0:
        cursor.execute("""
            INSERT INTO Users (username, firstName, lastName, email, mobileNumber, roleID, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "admin",
            "Admin",
            "User",
            "admin@test.com",
            "9999999999",
            1,
            hash_password("Taskadmin@123")
        ))

        conn.commit()

    conn.close()