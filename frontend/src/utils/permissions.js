// src/utils/permissions.js

import { getRoleName } from "../auth/auth";

const ROLE_PERMISSIONS = {
  Admin: {
    projects: ["view", "create", "edit", "delete"],
    tasks: ["view", "create", "assign", "edit", "delete"],
    efforts: ["view", "create", "assign", "edit", "delete"],
    users: ["view", "create", "edit", "delete"]
  },

  Manager: {
    projects: ["view", "create", "edit"],
    tasks: ["view", "create", "assign", "edit"],
    efforts: ["view", "create", "assign", "edit"],
    users: ["view", "create", "edit", "delete"]
  },

  "Team Lead": {
    projects: ["view"],
    tasks: ["view", "assign", "edit"],
    efforts: ["view", "assign", "edit"],
    users: []
  },

  "Team Member": {
    projects: ["view"],
    tasks: ["view"],
    efforts: ["view", "create"],
    users: []
  }
};

// ✅ Check module access (page level)
export const hasAccess = (module) => {
  const role = getRoleName();
  return ROLE_PERMISSIONS[role]?.[module]?.includes("view");
};

// ✅ Check action (button level)
export const canPerform = (module, action) => {
  const role = getRoleName();
  return ROLE_PERMISSIONS[role]?.[module]?.includes(action);
};