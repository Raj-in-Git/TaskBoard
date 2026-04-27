import { useState } from "react";
import API from "../api/axios";
import { canPerform } from "../utils/permissions";
import "./Users.css";

function Users() {
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    roleID: "",
    password: ""
  });

  const handleCreateUser = async () => {
    if (!canPerform("users", "create")) {
      alert("No permission");
      return;
    }

    try {
      await API.post("/users", form);
      alert("User created successfully");

      setForm({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        roleID: "",
        password: ""
      });
    } catch (err) {
      alert("Failed to create user");
    }
  };

  return (
    <div className="users-container">
      <div className="users-card">
        <h2>Create User</h2>

        <div className="form-group">
          <label>Username</label>
          <input value={form.username}
            onChange={(e) => setForm({...form, username: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>First Name</label>
          <input value={form.firstName}
            onChange={(e) => setForm({...form, firstName: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input value={form.lastName}
            onChange={(e) => setForm({...form, lastName: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <input value={form.mobileNumber}
            onChange={(e) => setForm({...form, mobileNumber: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select
            value={form.roleID}
            onChange={(e) => setForm({...form, roleID: e.target.value})}
          >
            <option value="">Select Role</option>
            <option value="1">Admin</option>
            <option value="2">Manager</option>
            <option value="3">Team Lead</option>
            <option value="4">Team Member</option>
          </select>
        </div>

        <button className="create-btn" onClick={handleCreateUser}>
          Create User
        </button>
      </div>
    </div>
  );
}

export default Users;