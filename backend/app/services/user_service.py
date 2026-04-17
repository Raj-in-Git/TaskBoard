from app.db.database import get_connection
from app.core.security import hash_password, verify_password, create_token
from fastapi import HTTPException


# -----------------------------
# CREATE USER
# -----------------------------
def create_user(user):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 🔍 Check duplicate username
        cursor.execute(
            "SELECT 1 FROM Users WHERE username = ?",
            (user.username,)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

        # 🔍 Check duplicate email (optional but recommended)
        cursor.execute(
            "SELECT 1 FROM Users WHERE email = ?",
            (user.email,)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        # 🔐 Insert user
        cursor.execute("""
            INSERT INTO Users 
            (username, firstName, lastName, email, mobileNumber, roleID, password)
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

        return {"message": "User created successfully"}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.close()

def login_user(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            u.userID,
            u.username, 
            u.password, 
            u.roleID,
            r.roleName
        FROM Users u
        LEFT JOIN Roles r ON u.roleID = r.roleID
        WHERE u.username = ?
    """, (data.username,))   # ✅ FIXED

    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username")

    user_id, username, pwd, roleID, roleName = user

    # 🔐 Verify password
    if not verify_password(data.password, pwd):
        raise HTTPException(status_code=401, detail="Invalid password")

    # 🔥 Create JWT (RBAC ready)
    token = create_token({
        "userID": user_id,
        "username": username,
        "roleID": roleID,
        "roleName": roleName   # 🔥 consistent naming
    })

    return {
        "access_token": token,
        "roleID": roleID,
        "roleName": roleName,
        "username": username
    }