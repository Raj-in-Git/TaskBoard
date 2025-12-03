
import React, { useState, useEffect} from "react";
import "./TasksTable.css";

function UpdateTable() {
  const [updates, setUpdates] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ task: "", update: "", efforts : "" });

  // ✅ Reusable fetch function
  const fetchUpdates = () => {
    fetch("http://127.0.0.1:8000/getUpdates")
      .then((res) => res.json())
      .then((data) => setUpdates(data))
      .catch((err) => console.error("Error fetching tasks:", err));
  };

  const fetchActiveTasks = () => {
    fetch("http://127.0.0.1:8000/tasks/active/name")
      .then((res) => res.json())
      .then((data) => setActiveTasks(data))
      .catch((err) => console.error("Error fetching:", err));
  };

  // Fetch once when page loads
  useEffect(() => {
    fetchUpdates();
  }, []);

  useEffect(() => {
    fetchActiveTasks();
  }, []);

  const handleChange = (e) => {
    setNewUpdate({ ...newUpdate, [e.target.name]: e.target.value });
  };

  // Add new task
  const handleSubmitUpdate = async () => {
    try {
      await fetch("http://127.0.0.1:8000/addUpdates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUpdate),
    
      
      });
      // alert("update Added!");
       // refresh to show new data
    }catch (err) {
    console.error(err);
    }
    window.location.reload(true);
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

  return (
    <div>
      <h3>Updates</h3>
      <button className="add-btn" onClick={() => setShowForm(true)}>
        + Add Update
      </button>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Task Name</th>
            <th>Updates</th>
            <th>Efforts</th>
          </tr>
        </thead>
        <tbody>
          {updates.map((update) => (
            <tr key={update.id}>
              <td>{formatDate(update.Updated_Time)}</td>
              <td>{update.Task_Name}</td>
              <td>{update.Update}</td>
              <td>{update.Efforts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* ------------------ NEW TASK MODAL ------------------ */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Update</h2>
            <select name="task" 
              value={newUpdate.task} 
              onChange={handleChange}>
              <option value="">-- Select Task --</option>
                {activeTasks.map((task, index) => (
                  <option key={index} value={task.taskname}>
                    {task.taskname}
                  </option>
                ))}
            </select>
            <br></br>
            <label>Details:</label>
            <textarea
              name="update"
              value={newUpdate.update}
              onChange={handleChange}
            ></textarea>

            <label>Efforts:</label>
            <input
              type="text"
              name="efforts"
              value={newUpdate.efforts}
              onChange={handleChange}
            />

            <div className="modal-actions">
              <button onClick={handleSubmitUpdate}>Save</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UpdateTable;
