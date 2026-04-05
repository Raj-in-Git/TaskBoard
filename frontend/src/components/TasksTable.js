import React, { useState, useEffect } from "react";
import "./TasksTable.css";
import API from "../api/axios";

function TasksTable() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  const [formData, setFormData] = useState({
    taskname: "",
    details: "",
    status: "",
    projectid: ""
  });

  const [newData, setNewData] = useState({
    taskname: "",
    details: "",
    status: "Active",
    projectid: ""
  });

  // -----------------------------
  // FETCH DATA
  // -----------------------------
  const fetchTasks = () => {
    API.get("/tasks/")
      .then(res => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTasks([]));
  };

  const fetchProjects = () => {
    API.get("/projects/")
      .then(res => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProjects([]));
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  // -----------------------------
  // OPEN TASK
  // -----------------------------
  const handleOpen = (task) => {
    setSelectedTask(task);
    setFormData({
      taskname: task.taskname,
      details: task.details,
      status: task.status,
      projectid: task.projectid
    });
    setIsEditing(false);
  };

  // -----------------------------
  // ADD TASK
  // -----------------------------
  const handleAddTask = async () => {
    if (!newData.taskname.trim()) {
      alert("Task name required");
      return;
    }

    try {
      await API.post("/tasks/", newData);
      setShowForm(false);
      setNewData({
        taskname: "",
        details: "",
        status: "Active",
        projectid: ""
      });
      fetchTasks();
    } catch {
      alert("Error creating task");
    }
  };

  // -----------------------------
  // UPDATE TASK
  // -----------------------------
  const handleSave = async () => {
    try {
      await API.put(`/tasks/${selectedTask.id}`, formData);
      setSelectedTask(null);
      setIsEditing(false);
      fetchTasks();
    } catch {
      alert("Error updating task");
    }
  };

  // -----------------------------
  // DELETE TASK
  // -----------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await API.delete(`/tasks/${id}`);
      setSelectedTask(null);
      fetchTasks();
    } catch {
      alert("Error deleting task");
    }
  };

  // -----------------------------
  // FORMAT DATE
  // -----------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString();
  };

  // -----------------------------
  // FILTERS
  // -----------------------------
  const activeTasks = tasks.filter(t => t.status === "Active");

  const filteredTasks = activeTasks.filter(t =>
    selectedProject ? Number(t.projectid) === Number(selectedProject) : true
  );

  const completedTasks = tasks.filter(t => t.status !== "Active");

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="task-container">

      <button className="add-btn" onClick={() => setShowForm(true)}>
        + Add Task
      </button>

      {/* ---------------- ACTIVE TASKS ---------------- */}
      <div className="header">
        <h3>Active Tasks</h3>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.ProjectID} value={p.ProjectID}>
              {p.ProjectName}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Task</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.id}>
              <td><span className="project-badge">{task.projectname}</span></td>
              <td>
                <a href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpen(task);
                  }}>
                  {task.taskname}
                </a>
              </td>
              <td>{task.details}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------------- COMPLETED ---------------- */}
      <h3 onClick={() => setShowCompleted(!showCompleted)}>
        {showCompleted ? "▼" : "▶"} Completed ({completedTasks.length})
      </h3>

      {showCompleted && (
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Details</th>
              <th>Created</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {completedTasks.map(t => (
              <tr key={t.id}>
                <td>{t.taskname}</td>
                <td>{t.details}</td>
                <td>{formatDate(t.created_at)}</td>
                <td>{formatDate(t.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ---------------- ADD Task ---------------- */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Task</h2>

            <select name="projectid"
              onChange={(e) => setNewData({ ...newData, projectid: e.target.value })}>
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.ProjectID} value={p.ProjectID}>
                  {p.ProjectName}
                </option>
              ))}
            </select>

            <input
              placeholder="Task Name"
              onChange={(e) => setNewData({ ...newData, taskname: e.target.value })}
            />

            <textarea
              placeholder="Details"
              onChange={(e) => setNewData({ ...newData, details: e.target.value })}
            />

            <div className="modal-actions">
              <button className="save-btn" onClick={handleAddTask}>Save</button>
              <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- VIEW / EDIT ---------------- */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">

            {!isEditing ? (
              <>
                <h2>{selectedTask.taskname}</h2>
                <p>{selectedTask.details}</p>

                <div className="modal-actions">
                  <button className="save-btn" onClick={() => setIsEditing(true)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(selectedTask.id)}>Delete</button>
                  <button className="cancel-btn" onClick={() => setSelectedTask(null)}>Close</button>
                </div>
              </>
            ) : (
              <>
                <input
                  value={formData.taskname}
                  onChange={(e) => setFormData({ ...formData, taskname: e.target.value })}
                />

                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                />

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>

                <div className="modal-actions">
                  <button className="save-btn" onClick={handleSave}>Save</button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
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