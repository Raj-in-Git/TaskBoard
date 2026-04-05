export const loginUser = (data) => {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.roleID);
};

export const logoutUser = () => {
  localStorage.clear();
  window.location.href = "/";
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getRole = () => localStorage.getItem("role");