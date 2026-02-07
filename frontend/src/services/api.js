import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mitr-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("mitr-token");
    }
    return Promise.reject(error);
  },
);

// ====================== AUTH ======================
export const login = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const signupInitiate = async (data) => {
  try {
    const response = await api.post("/auth/signup/initiate", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Signup initiation failed",
    );
  }
};

export const signupComplete = async (data) => {
  try {
    const response = await api.post("/auth/signup/complete", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Signup completion failed",
    );
  }
};

export const forgotPassword = async (data) => {
  try {
    const response = await api.post("/auth/forgot-password", data);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to send OTP");
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await api.post("/auth/reset-password", data);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Password reset failed");
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout failed");
  }
};

export const logoutAll = async () => {
  try {
    const response = await api.post("/auth/logout-all");
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout all failed");
  }
};

// ====================== USER ======================
export const getProfile = async () => {
  try {
    const response = await api.get("/user/profile");
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
};

export const changePassword = async (data) => {
  try {
    const response = await api.post("/user/change-password", data);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to change password",
    );
  }
};

export const updateUserInfo = async (data) => {
  try {
    const response = await api.put("/auth/user/update", data);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update user information",
    );
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete("/user/account");
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete account",
    );
  }
};

// ====================== DEVICE ======================
export const createDevice = async (data, apiKey) => {
  try {
    const response = await api.post("/device/create", data, {
      headers: { "x-api-key": apiKey },
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create device");
  }
};

export const linkDevice = async (data) => {
  try {
    const response = await api.post("/device/link", data);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to link device");
  }
};

export const getDevice = async (deviceId) => {
  try {
    const response = await api.get(`/device/${deviceId}`);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch device");
  }
};

export const updateEmergencyContacts = async (deviceId, contacts) => {
  try {
    const response = await api.put(`/device/${deviceId}/emergency-contacts`, {
      emergencyContacts: contacts,
    });
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update emergency contacts",
    );
  }
};

export const updateTriggerWords = async (deviceId, words) => {
  try {
    const response = await api.put(`/device/${deviceId}/trigger-words`, {
      triggerWords: words,
    });
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update trigger words",
    );
  }
};

// ====================== SESSION ======================
export const startTrigger = async (deviceId, initialLocation = null) => {
  try {
    const response = await api.post("/sessions/start", {
      deviceId,
      initialLocation,
    });
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to start trigger session",
    );
  }
};

export const addCoordinates = async (deviceId, coordinates) => {
  try {
    const response = await api.post("/sessions/coordinates", {
      deviceId,
      ...coordinates,
    });
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to add coordinates",
    );
  }
};

export const stopTrigger = async (deviceId, apiKey) => {
  try {
    const response = await api.post(
      "/sessions/stop",
      { deviceId },
      {
        headers: {
          "x-api-key": apiKey,
        },
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to stop trigger session",
    );
  }
};

export const getSessionStatus = async (deviceId) => {
  try {
    const response = await api.get(`/sessions/status/${deviceId}`);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get session status",
    );
  }
};

export const getSessionDetails = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}`);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch session details",
    );
  }
};

export const getSessionHistory = async (deviceId = null) => {
  try {
    const params = deviceId ? { deviceId } : {};
    const response = await api.get("/sessions/history", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch session history",
    );
  }
};

export const getCurrentLocation = async (deviceId) => {
  try {
    const response = await api.get(`/sessions/current-location/${deviceId}`);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch current location",
    );
  }
};

export const getActiveSessions = async () => {
  try {
    const response = await api.get("/sessions/active");
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch active sessions",
    );
  }
};

export const updateEmergencyData = async (data) => {
  try {
    const response = await api.post("/update-emergency-data", data);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update emergency data",
    );
  }
};

// Assign to a named variable before exporting
const apiService = {
  login,
  signupInitiate,
  signupComplete,
  forgotPassword,
  resetPassword,
  logout,
  logoutAll,
  getProfile,
  changePassword,
  deleteAccount,
  updateUserInfo,
  createDevice,
  linkDevice,
  getDevice,
  updateEmergencyContacts,
  updateTriggerWords,
  startTrigger,
  addCoordinates,
  stopTrigger,
  getSessionStatus,
  getSessionDetails,
  getSessionHistory,
  getCurrentLocation,
  getActiveSessions,
  updateEmergencyData,
};

export default apiService;
