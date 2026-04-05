import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import "./NavBar.css";

function NavBar({ effortPercent }) {
  const [activeTasks, setActiveTasks] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [updates, setUpdates] = useState([]);

  // ✅ Fetch data once
  useEffect(() => {

    // Tasks
    API.get("/tasks/")
      .then(res => {
        const count = res.data.filter(t => t.status === "Active").length;
        setActiveTasks(count);
      })
      .catch(() => setActiveTasks(0));

    // Projects
    API.get("/projects/")
      .then(res => {
        const count = res.data.filter(p => p.Status === "Active").length;
        setActiveProjects(count);
      })
      .catch(() => setActiveProjects(0));

    API.get("/updates/")
    .then(res => setUpdates(Array.isArray(res.data) ? res.data : []))
    .catch(() => setUpdates([]));

  }, []);

  const todayEffort = (updates || [])
  .filter((item) => {
    const today = new Date();
    const itemDate = new Date(item.date);
    return itemDate.toDateString() === today.toDateString();
  })
  .reduce((sum, item) => sum + Number(item.efforts || 0), 0);

const todayProductivity = Math.min((todayEffort / 8) * 100, 100).toFixed(0);



  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" :
    hour < 18 ? "Good Afternoon" :
    "Good Evening";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        TaskBoard
        <div className="nav-subtitle">
          {greeting}, <span className="username">Rajesh</span> 👋
        </div>
      </div>

      <ul className="nav-links">
        <li><Link to="/home">Home</Link></li>

        <li>
          <Link to="/efforts">
            Efforts
            <span className="nav-count-badge"
              style={{
                backgroundColor:
                  effortPercent < 50 ? "#f44336" :
                  effortPercent < 80 ? "#ff9800" :
                  "#4caf50"
              }}>
              {effortPercent ?? 0}%
            </span>
          </Link>
        </li>

        <li>
          <Link to="/tasks">
            Tasks {activeTasks > 0 && (
              <span className="nav-count-badge">{activeTasks}</span>
            )}
          </Link>
        </li>

        <li>
          <Link to="/projects">
            Projects {activeProjects > 0 && (
              <span className="nav-count-badge">{activeProjects}</span>
            )}
          </Link>
        </li>
      </ul>

      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default NavBar;