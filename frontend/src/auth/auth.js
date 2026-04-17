import { jwtDecode } from "jwt-decode";

// Save token
export const loginUser = (data) => {
  localStorage.setItem("token", data.access_token);
};

// Logout
export const logoutUser = () => {
  localStorage.clear();
  window.location.href = "/";
};

// Check login
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Decode user
export const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    var data = jwtDecode(token);
    console.log(data);
    return data;
    
    
  } catch {
    return null;
  }
};

// ✅ ADD THIS
export const getToken = () => {
  return localStorage.getItem("token");
};

// Role helpers
export const getRoleID = () => getUser()?.roleID;
export const getRoleName = () => getUser()?.roleName;
