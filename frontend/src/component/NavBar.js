import React,{useState, useEffect} from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  const [activeTasks, setActiveTasks] = useState("")

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

  return (
    <nav className="navbar">
      <div className="nav-logo">TaskBoard</div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/tasks">Tasks {activeTasks > 0 && (<span className="nav-count-badge">{activeTasks}</span>)}</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;
