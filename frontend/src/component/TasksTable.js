import React, { useState, useEffect} from "react";
import "./TasksTable.css";

function TasksTable({ onRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ taskname: "", details: "",status: "" });
  const [newData, setNewData] = useState({ taskname: "", details: "", status : "Active" });
  const [showForm, setShowForm] = useState(false);
  const [activeTasks, setActiveTasks] = useState("")
  // -----------------------------
  // OPEN EXISTING TASK
  // -----------------------------
    // ✅ Reusable fetch functions
    const fetchTasks = () => {
      fetch("http://127.0.0.1:8000/tasks")
        .then((res) => res.json())
        .then((data) => setTasks(data))
        .catch((err) => console.error("Error fetching tasks:", err));
    };
  
  
    // Fetch once when page loads
    useEffect(() => {
      fetchTasks();
    }, []);
  
   
  
    // ✅ get active tasks
    const fetchactivetasks = () => {
      fetch("http://127.0.0.1:8000/tasks/active")
        .then((res) => res.json())
        .then((data) => setActiveTasks(data))
        .catch((err) => console.error("Error fetching tasks:", err));
    };
  
      // Fetch once when page loads
    useEffect(() => {
      fetchactivetasks();
    });
  
  
  const handleOpen = (task) => {
    setSelectedTask(task);
    setFormData({
      taskname: task.taskname,
      details: task.details,
    });
    setIsEditing(false);
  };

  // -----------------------------
  // CLOSE MODAL
  // -----------------------------
  const handleClose = () => {
    setSelectedTask(null);
    setIsEditing(false);
    if (onRefresh) onRefresh();
    window.location.reload(true);
  };

  // -----------------------------
  // EDIT EXISTING TASK CHANGE
  // -----------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -----------------------------
  // SAVE EXISTING TASK
  // -----------------------------
  const handleSave = () => {
    const updatedTask = { ...selectedTask, ...formData };
    handleEdit(updatedTask);
    setSelectedTask(updatedTask);
    setIsEditing(false);
    if (onRefresh) onRefresh();
    window.location.reload(true);
  };

  // -----------------------------
  // NEW TASK CHANGE HANDLER
  // -----------------------------
  const handlenewChange = (e) => {
    setNewData({ ...newData, [e.target.name]: e.target.value });
  };

  // -----------------------------
  // ADD NEW TASK
  // -----------------------------
  const handlenewSubmittask = async () => {
    try {
      await fetch("http://127.0.0.1:8000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      // alert("Task Added!");
      window.location.reload(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      fetch(`http://127.0.0.1:8000/tasks/${id}`, { method: "DELETE" })
        .then((res) => {
          if (res.ok)
          window.location.reload(true); // refresh to show new data;
        })
        .catch((err) => console.error(err));
    }
  };

  const handleEdit = (updatedTask) => {
    fetch(`http://127.0.0.1:8000/tasks/${updatedTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskname: updatedTask.taskname,
        details: updatedTask.details,
        status: updatedTask.status

      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update task");
        return res.json();
      })
      .then((data) => {
        setTasks(tasks.map((t) => (t.id === data.id ? data : t)));
      })
      .then(() => {
          // ✅ After saving, refresh from DB
          fetchTasks();
        })
      .catch((err) => console.error(err));
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).replace(",", "");
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="task-container">
      <button className="add-btn" onClick={() => setShowForm(true)}>
        + Add Task
      </button>
      {activeTasks === 0 ? (
        <p>No active tasks 🎉</p>
    ) : (
      <>
      <h3>Active Tasks List</h3>
       <table>
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Task Details</th>
          </tr>
        </thead>

        <tbody>
          {tasks.filter(task => task.status === 'Active')
            .map((task) => (
            <tr key={task.id}>
              <td>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpen(task);
                  }}
                  style={{ color: "blue", cursor: "pointer" , textDecoration: 'none'}}
                >
                  {task.taskname}
                </a>
              </td>

              <td>{task.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </>
      )}
 {/* ------------------ View Completed Task ------------------ */}

<h3>Completed Tasks List</h3>
  <div className="table-container">
    <table className="custom-table">  
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Task Details</th>
            <th>Created Time</th>
            <th>Completed Time</th>
          </tr>
        </thead>
        <tbody>
          {tasks.filter(task => task.status !== 'Active')
            .map(task => (
              <tr key={task.id}>
                <td>{task.taskname}</td>
                <td>{task.details}</td>
                <td>{formatDate(task.created_at)}</td>
                <td>{formatDate(task.updated_at)}</td>
              </tr>
          ))}
        </tbody>
      </table>
      </div>
      {/* ------------------ NEW TASK MODAL ------------------ */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Task</h2>

            <label>Task Name:</label>
            <input
              type="text"
              name="taskname"
              value={newData.taskname}
              onChange={handlenewChange}
            />
            <br></br>
            <label>Details:</label>
            <textarea
              name="details"
              value={newData.details}
              onChange={handlenewChange}
            ></textarea>

            <div className="modal-actions">
              <button onClick={handlenewSubmittask}>Save</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ EXISTING TASK MODAL ------------------ */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedTask.taskname}</h2>

            {!isEditing ? (
              <>
                <p><b>Details:</b> {selectedTask.details}</p>
                <p><b>Created:</b> {new Date(selectedTask.created_at).toLocaleString()}</p>
                <p><b>Updated:</b> {new Date(selectedTask.updated_at).toLocaleString()}</p>

                <div className="modal-actions">
                  <button onClick={() => setIsEditing(true)}>Edit</button>
                  <button
                    onClick={() => handleDelete(selectedTask.id)}
                    style={{ backgroundColor: "red" }}
                  >
                    Delete
                  </button>
                  <button onClick={handleClose}>Close</button>
                </div>
              </>
            ) : (
              <>
                <label>Task Name:</label>
                <input
                  type="text"
                  name="taskname"
                  value={formData.taskname}
                  onChange={handleChange}
                />

                <label>Details:</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                />

                <label>Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="">-- Select Status --</option>
                  <option value="">Completed</option>
                  </select>
                <div className="modal-actions">
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default TasksTable;
