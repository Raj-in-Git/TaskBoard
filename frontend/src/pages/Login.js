import { useState } from "react";
import API from "../api/axios";
import { loginUser } from "../auth/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import "./Login.css";
import { useNavigate } from "react-router-dom";



function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 🔥 FIXED API PATH
      const res = await API.post("/login", form);

      // 🔐 Save token
      loginUser(res.data);

      // ✅ Redirect to dashboard
      navigate("/dashboard");;

    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">

        <h2>TaskBoard</h2>
        <p className="subtitle">Sign in to continue</p>

        {/* Username */}
        <div className="input-group">
          <input
            type="text"
            required
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <label>Username</label>
        </div>

        {/* Password */}
        <div className="input-group password-group">
          <input
            type={showPassword ? "text" : "password"}
            required
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <label>Password</label>

          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {/* Error */}
        {error && <p className="error">{error}</p>}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={loading ? "loading" : ""}
        >
          {loading ? (
            <>
              <Loader2 className="spinner" size={18} />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

      </div>
    </div>
  );
}

export default Login;