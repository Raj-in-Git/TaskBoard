from app.db.database import get_connection
from fastapi import HTTPException

# ✅ Get all projects
def get_projects():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ProjectID, ProjectName, projectDescription, Status
        FROM Projects
        ORDER BY ProjectName
    """)

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "ProjectID": r[0],
            "ProjectName": r[1],
            "Description": r[2],
            "Status": r[3]
        }
        for r in rows
    ]


# ✅ Create project
def create_project(project):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO Projects (ProjectName, projectDescription, Status)
        VALUES (?, ?, ?)
    """, (
        project.projectname,
        project.description,
        project.status
    ))

    conn.commit()
    conn.close()


# ✅ Update project
def update_project(project_id, project):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE Projects
        SET ProjectName=?, projectDescription=?, Status=?
        WHERE ProjectID=?
    """, (
        project.projectname,
        project.description,
        project.status,
        project_id
    ))

    if cursor.rowcount == 0:
        raise HTTPException(404, "Project not found")

    conn.commit()
    conn.close()


# ✅ Delete project (Smart delete like your original logic)
def delete_project(project_id):
    conn = get_connection()
    cursor = conn.cursor()

    # Check tasks
    cursor.execute("SELECT COUNT(*) FROM Tasks WHERE ProjectID=?", project_id)
    task_count = cursor.fetchone()[0]

    if task_count > 0:
        # Soft delete
        cursor.execute("""
            UPDATE Projects
            SET Status='Inactive'
            WHERE ProjectID=?
        """, project_id)

        message = "Project has tasks → set to Inactive"

    else:
        # Hard delete
        cursor.execute("""
            DELETE FROM Projects
            WHERE ProjectID=?
        """, project_id)

        message = "Project deleted permanently"

    if cursor.rowcount == 0:
        raise HTTPException(404, "Project not found")

    conn.commit()
    conn.close()

    return {
        "message": message,
        "task_count": task_count
    }