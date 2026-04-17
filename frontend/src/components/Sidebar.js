import { Link } from "react-router-dom";
import { getRoleName, logoutUser } from "../auth/auth";
import { hasAccess } from "../utils/permissions";

function Sidebar() {
  const role = getRoleName();

  return (
    <div style={containerStyle}>
      <h2>TaskBoard</h2>

      <Link to="/dashboard" style={linkStyle}>Dashboard</Link>

      {hasAccess("projects") && (
        <Link to="/projects" style={linkStyle}>Projects</Link>
      )}

      {hasAccess("tasks") && (
        <Link to="/tasks" style={linkStyle}>Tasks</Link>
      )}

      {hasAccess("efforts") && (
        <Link to="/efforts" style={linkStyle}>Efforts</Link>
      )}

      {hasAccess("users") && (
        <Link to="/users" style={linkStyle}>Users</Link>
      )}

      <button onClick={logoutUser} style={btnStyle}>Logout</button>
    </div>
  );
}

const containerStyle = {
  width: "220px",
  background: "#1e293b",
  color: "white",
  height: "100vh",
  padding: "15px"
};

const linkStyle = {
  display: "block",
  color: "white",
  margin: "10px 0",
  textDecoration: "none"
};

const btnStyle = {
  marginTop: "20px",
  padding: "10px",
  width: "100%"
};

export default Sidebar;