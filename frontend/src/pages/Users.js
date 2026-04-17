import { useState } from "react";
import API from "../api/axios";
import { canPerform } from "../utils/permissions";

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
      console.error(err);
      alert("Failed to create user");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create User</h2>

      <input placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({...form, username: e.target.value})}
      />

      <input placeholder="First Name"
        value={form.firstName}
        onChange={(e) => setForm({...form, firstName: e.target.value})}
      />

      <input placeholder="Last Name"
        value={form.lastName}
        onChange={(e) => setForm({...form, lastName: e.target.value})}
      />

      <input placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({...form, email: e.target.value})}
      />

      <input placeholder="Mobile Number"
        value={form.mobileNumber}
        onChange={(e) => setForm({...form, mobileNumber: e.target.value})}
      />

      <input type="password" placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({...form, password: e.target.value})}
      />

      {/* Role Dropdown */}
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

      <br /><br />

      <button onClick={handleCreateUser}>
        Create User
      </button>
    </div>
  );
}

export default Users;