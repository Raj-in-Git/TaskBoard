from app.db.database import get_connection
from app.core.security import hash_password, verify_password, create_token
from fastapi import HTTPException

def create_user(user):
    conn = get_connection()
    cursor = conn.cursor()

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
        hash_password(user.password)
    ))

    conn.commit()
    conn.close()

def login_user(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT userID, username, password, roleID FROM Users WHERE username=?", data.username)
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(401, "Invalid username")

    user_id, username, pwd, roleID = user

    if not verify_password(data.password, pwd):
        raise HTTPException(401, "Invalid password")

    return {
        "access_token": create_token({"user_id": user_id, "roleID": roleID}),
        "roleID": roleID
    }