import React, { useState, useEffect } from "react";
import "./TasksTable.css";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Dashboard({setEffortPercent}) {
  const [updates, setUpdates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const navigate = useNavigate();

  // -----------------------------
  // FETCH DATA
  // -----------------------------
  useEffect(() => {
    API.get("/updates/")
      .then(res => setUpdates(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUpdates([]));

    API.get("/projects/")
      .then(res => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProjects([]));

    API.get("/tasks/")
      .then(res => setTasks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTasks([]));

  }, []);

  // -----------------------------
  // KPI CALCULATIONS
  // -----------------------------

  // Active Tasks
  const activeTasks = (tasks || []).filter(
    (item) => item?.status === "Active"
  ).length;
  console.log(activeTasks);

  // Active Projects
  const activeProjects = [
    ...new Set(
      (projects || [])
        .filter(item => item?.Status?.toLowerCase() === "active")
        .map(item => item?.ProjectName)
    )
  ].length;

  // Project names (tooltip)
  const activeProjectNames = [
    ...new Set(
      (projects || [])
        .filter(item => item?.Status?.toLowerCase() === "active")
        .map(item => item?.ProjectName)
    )
  ];

  // Today's Effort
const todayEffort = (updates || [])
  .filter((item) => {
    if (!item.date) return false;

    const today = new Date();
    const itemDate = new Date(item.date);

    return itemDate.toDateString() === today.toDateString();
  })
  .reduce((sum, item) => sum + Number(item.efforts || 0), 0);

// Productivity %
const todayProductivity = Math.round(Math.min((todayEffort / 8) * 100, 100)
);

// Update Navbar
useEffect(() => {
  if (updates.length > 0) {
    setEffortPercent(todayProductivity.toFixed(0));
  }
}, [updates, todayProductivity]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="dashboard">
      <div className="kpi-wrapper">
        {/* PRODUCTIVITY */}
        <div className="kpi-card clickable" onClick={() => navigate("/efforts")}>
          <h4>Today's Productivity</h4>

          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${todayProductivity}%` }}
            ></div>
          </div>

          <p
            className="progress-text"
            style={{
              color:
                todayProductivity < 50
                  ? "#f44336"
                  : todayProductivity < 80
                  ? "#ff9800"
                  : "#4caf50"
            }}
          >
            {todayProductivity}%
          </p>

          <span>Click to Add/View Efforts..</span>
        </div>

        {/* ACTIVE TASKS */}
        <div className="kpi-card clickable" onClick={() => navigate("/tasks")}>
          <h4>Active Tasks</h4>
          <p>{activeTasks}</p>
          <span>Click to Add/View Tasks...</span>
        </div>

        {/* ACTIVE PROJECTS */}
        <div className="kpi-card clickable" onClick={() => navigate("/projects")}>
          <h4>Active Projects</h4>
          <p title={activeProjectNames.join(", ")}>
            {activeProjects}
          </p>
          <span>Click to Add/View Projects...</span>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;