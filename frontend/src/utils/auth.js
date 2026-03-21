// Auth utility functions for consistent token management and API headers

export const getUserToken = () => localStorage.getItem("userToken");
export const getDriverToken = () => localStorage.getItem("driverToken");
export const getAdminToken = () => localStorage.getItem("adminToken");

export const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("userData") || "null");
  } catch (error) {
    console.log("User data parse error:", error);
    return null;
  }
};

export const getDriverData = () => {
  try {
    return JSON.parse(localStorage.getItem("driverData") || "null");
  } catch (error) {
    console.log("Driver data parse error:", error);
    return null;
  }
};

export const getAdminData = () => {
  try {
    return JSON.parse(localStorage.getItem("adminData") || "null");
  } catch (error) {
    console.log("Admin data parse error:", error);
    return null;
  }
};

export const getAuthHeader = (role = "user") => {
  let token;
  switch (role) {
    case "user":
      token = getUserToken();
      break;
    case "driver":
      token = getDriverToken();
      break;
    case "admin":
      token = getAdminToken();
      break;
    default:
      token = getUserToken();
  }

  if (!token) {
    throw new Error("No authentication token found. Please login first.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const isAuthenticated = (role = "user") => {
  switch (role) {
    case "user":
      return !!getUserToken() && !!getUserData();
    case "driver":
      return !!getDriverToken() && !!getDriverData();
    case "admin":
      return !!getAdminToken() && !!getAdminData();
    default:
      return false;
  }
};

export const logout = (role = "user") => {
  switch (role) {
    case "user":
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      break;
    case "driver":
      localStorage.removeItem("driverToken");
      localStorage.removeItem("driverData");
      break;
    case "admin":
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      break;
  }
};