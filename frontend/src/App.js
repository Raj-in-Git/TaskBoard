import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import TasksTable from "./components/TasksTable";
import UpdateTable from "./components/updateTable";
import ProjectsTable from "./components/ProjectsTable";
import Dashboard from "./components/Dashboard";
import Login from "./pages/Login";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
// import Roles from "./pages/Roles";

import "./App.css";

function App() {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <Router>
      <Layout>
        <Routes>

        {/* 🔐 Login */}
        <Route path="/" element={<Login />} />

        {/* 🔐 Dashboard (no role restriction) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* 🔥 Efforts (ALL roles allowed) */}
        <Route path="/efforts" element={
          <ProtectedRoute module="efforts">
            <UpdateTable />
          </ProtectedRoute>
        } />

        {/* 🔥 Tasks (Manager + Team Lead) */}
        <Route path="/tasks" element={
          <ProtectedRoute module="tasks">
            <TasksTable />
          </ProtectedRoute>
        } />

        {/* 🔥 Projects (Admin + Manager) */}
        <Route path="/projects" element={
          <ProtectedRoute module="projects">
            <ProjectsTable />
          </ProtectedRoute>
        } />
        <Route
          path="/users"
          element={
            <ProtectedRoute module="users">
              <Users />
            </ProtectedRoute>
        }/>
        <Route path="/users" element={<Users />} />
        {/* <Route path="/users/view" element={<UsersList />} />
        <Route path="/users/edit" element={<EditUser />} /> */}
      </Routes>  
      </Layout>   
    </Router>
  );
}

export default App;