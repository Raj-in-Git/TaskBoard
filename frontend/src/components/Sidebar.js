import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="logo">TaskBoard</h2>

        <ul>
          <li className={location.pathname === "/dashboard" ? "active" : ""}>
            <Link to="/dashboard">Dashboard</Link>
          </li>x

          <li className={location.pathname === "/projects" ? "active" : ""}>
            <Link to="/projects">Projects</Link>
          </li>

          <li className={location.pathname === "/tasks" ? "active" : ""}>
            <Link to="/tasks">Tasks</Link>
          </li>

          {/* ✅ Users Dropdown */}
          <li className="dropdown">
            <div className="dropdown-header" onClick={() => toggleMenu("users")}>
              Users
              <span>{openMenu === "users" ? "▲" : "▼"}</span>
            </div>

            {openMenu === "users" && (
              <ul className="submenu">
                <li>
                  <Link to="/users" onClick={toggleSidebar}>
                    Create User
                  </Link>
                </li>
                <li>
                  <Link to="/users/view" onClick={toggleSidebar}>
                    View Users
                  </Link>
                </li>
                <li>
                  <Link to="/users/edit" onClick={toggleSidebar}>
                    Edit User
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;