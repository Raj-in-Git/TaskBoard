import React, { useState, useEffect } from "react";
import "./TasksTable.css";
import API from "../api/axios";
import { canPerform } from "../utils/permissions";

function ProjectsTable() {

  // ✅ ALL HOOKS AT TOP (IMPORTANT)
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [newProject, setNewProject] = useState({
    projectname: "",
    description: "",
    status: "Active"
  });

  const [formData, setFormData] = useState({
    projectname: "",
    description: "",
    status: "Active"
  });

  // -----------------------------
  // FETCH PROJECTS
  // -----------------------------
  const fetchProjects = () => {
    API.get("/projects/")
      .then((res) => {
        setProjects(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setProjects([]);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // -----------------------------
  // ADD PROJECT
  // -----------------------------
  const handleAddProject = async () => {
    if (!newProject.projectname.trim()) {
      alert("Project name is required");
      return;
    }

    if (!canPerform("projects", "create")) {
      alert("No permission to create project");
      return;
    }

    try {
      await API.post("/projects/", newProject);

      setShowForm(false);
      setNewProject({
        projectname: "",
        description: "",
        status: "Active"
      });

      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    }
  };

  // -----------------------------
  // OPEN PROJECT
  // -----------------------------
  const handleOpen = (project) => {
    setSelectedProject(project);

    setFormData({
      projectname: project.ProjectName,
      description: project.Description,
      status: project.Status
    });

    setIsEditing(false);
  };

  // -----------------------------
  // UPDATE PROJECT
  // -----------------------------
  const handleSave = async () => {
    if (!canPerform("projects", "edit")) {
      alert("No permission to edit");
      return;
    }

    try {
      await API.put(`/projects/${selectedProject.ProjectID}`, formData);

      setIsEditing(false);
      setSelectedProject(null);

      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to update project");
    }
  };

  // -----------------------------
  // DELETE PROJECT
  // -----------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    if (!canPerform("projects", "delete")) {
      alert("No permission to delete");
      return;
    }

    try {
      const res = await API.delete(`/projects/${id}`);
      alert(res.data.message);

      fetchProjects();
      setSelectedProject(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="task-container">
      <h3>Projects</h3>

      {/* ✅ CREATE BUTTON */}
      {canPerform("projects", "create") && (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Add Project
        </button>
      )}

      {/* TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p) => (
              <tr key={p.ProjectID}>
                <td>
                  <a
                    className="project-badge"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpen(p);
                    }}
                    style={{ color: "blue", textDecoration: "none" }}
                  >
                    {p.ProjectName}
                  </a>
                </td>
                <td>{p.Description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------ ADD PROJECT ------------------ */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Project</h2>

            <label>Project Name:</label>
            <input
              type="text"
              value={newProject.projectname}
              onChange={(e) =>
                setNewProject({ ...newProject, projectname: e.target.value })
              }
            />

            <label>Description:</label>
            <textarea
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={handleAddProject}>Save</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ VIEW / EDIT PROJECT ------------------ */}
      {selectedProject && (
        <div className="modal-overlay">
          <div className="modal-content">
            {!isEditing ? (
              <>
                <h2>{selectedProject.ProjectName}</h2>
                <p>{selectedProject.Description}</p>

                <div className="modal-actions">

                  {canPerform("projects", "edit") && (
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                  )}

                  {canPerform("projects", "delete") && (
                    <button
                      onClick={() => handleDelete(selectedProject.ProjectID)}
                      style={{ backgroundColor: "red" }}
                    >
                      Delete
                    </button>
                  )}

                  <button onClick={() => setSelectedProject(null)}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <label>Name:</label>
                <input
                  value={formData.projectname}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectname: e.target.value
                    })
                  }
                />

                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value
                    })
                  }
                />

                <label>Status:</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Hold">Hold</option>
                  <option value="Completed">Completed</option>
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

export default ProjectsTable;