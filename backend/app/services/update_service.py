from app.db.database import get_connection

def get_updates():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            u.updateID,
            u.updates,
            u.efforts,
            u.updateDate,
            t.taskname,
            p.projectname
        FROM Updates u
        LEFT JOIN Tasks t ON u.taskID = t.taskID
        LEFT JOIN Projects p ON t.projectID = p.projectID
        ORDER BY u.updateDate DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": r[0],
            "update": r[1],
            "efforts": r[2],
            "date": r[3],
            "task": r[4],
            "project": r[5]
        }
        for r in rows
    ]


def create_update(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO Updates (taskID, updates, efforts, updateDate)
        VALUES (?, ?, ?, GETDATE())
    """, (
        data.taskID,
        data.updates,
        data.efforts
    ))

    conn.commit()
    conn.close()


def update_update(update_id, data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE Updates
        SET taskID=?, updates=?, efforts=?
        WHERE updateID=?
    """, (
        data.taskID,
        data.updates,
        data.efforts,
        update_id
    ))

    conn.commit()
    conn.close()


def delete_update(update_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM Updates WHERE updateID=?", update_id)

    conn.commit()
    conn.close()