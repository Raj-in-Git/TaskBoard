from app.db.database import get_connection
from fastapi import HTTPException
from datetime import datetime

def get_tasks():
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
    conn.close()

    return [
        {
            "id": r[0],
            "taskname": r[1],
            "details": r[2],
            "status": r[3],
            "created_at": r[4],
            "updated_at": r[5],
            "projectname": r[7],
            "projectid": r[6]
        }
        for r in rows
    ]


def create_task(task):
    conn = get_connection()
    cursor = conn.cursor()

    now = datetime.now()

    cursor.execute("""
        INSERT INTO tasks (taskname, taskdescription, startDate, completeddate, status, ProjectID)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        task.taskname,
        task.details,
        now,
        now,
        "Active",
        task.projectid
    ))

    conn.commit()
    conn.close()


def update_task(task_id, task):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE tasks
        SET taskname=?, taskdescription=?, status=?, projectid=?
        WHERE taskid=?
    """, (
        task.taskname,
        task.details,
        task.status,
        task.projectid,
        task_id
    ))

    if cursor.rowcount == 0:
        raise HTTPException(404, "Task not found")

    conn.commit()
    conn.close()


def delete_task(task_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM tasks WHERE taskid=?", task_id)

    conn.commit()
    conn.close()