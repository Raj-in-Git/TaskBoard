import { useState } from "react";
import API from "../api/axios";
import { loginUser } from "../auth/auth";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // ✅ Basic validation
    if (!form.username || !form.password) {
      setError("Please enter username and password");
      return;
    }
    try {
      const res = await API.post("/login", form);
      loginUser(res.data);
      window.location.href = "/home";
    } catch {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>

      <input placeholder="Username"
        onChange={e => setForm({ ...form, username: e.target.value })} />

      <br /><br />

      <input type="password" placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })} />

      <br /><br />

      <button onClick={handleLogin}>Login</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;