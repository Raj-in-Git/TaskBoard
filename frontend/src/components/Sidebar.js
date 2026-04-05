import { Link } from "react-router-dom";
import { getRole, logoutUser } from "../auth/auth";

function Sidebar() {
  const role = getRole();

  return (
    <div style={{
      width: "220px",
      background: "#1e293b",
      color: "white",
      height: "100vh",
      padding: "15px"
    }}>
      <h2>TaskBoard</h2>

      <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
      <Link to="/projects" style={linkStyle}>Projects</Link>
      <Link to="/tasks" style={linkStyle}>Tasks</Link>

      {role == 1 && (
        <Link to="/users" style={linkStyle}>Users</Link>
      )}

      <button onClick={logoutUser} style={btnStyle}>Logout</button>
    </div>
  );
}

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