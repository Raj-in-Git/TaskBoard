import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from "react";

import NavBar from "./components/NavBar";
import TasksTable from "./components/TasksTable";
import UpdateTable from "./components/updateTable";
import ProjectsTable from "./components/ProjectsTable";
import Dashboard from "./components/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  const [effortPercent, setEffortPercent] = useState(0);

  const isLoggedIn = localStorage.getItem("token");

  return (
    <Router>

      {/* ✅ Show Navbar only after login */}
      {isLoggedIn && <NavBar effortPercent={effortPercent} />}

      <Routes>

        {/* 🔐 Login */}
        <Route path="/" element={<Login />} />

        {/* 🔐 Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Dashboard setEffortPercent={setEffortPercent} />
          </ProtectedRoute>
        } />

        <Route path="/efforts" element={
          <ProtectedRoute>
            <UpdateTable />
          </ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute>
            <TasksTable />
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectsTable />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;