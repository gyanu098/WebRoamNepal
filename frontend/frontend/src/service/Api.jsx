// src/service/Api.jsx
import axios from "axios";

export const BASE_URL = import.meta.env.VITE_BASE_URL; // e.g. http://localhost:5000

const Api = axios.create({
  baseURL: BASE_URL,
});

// Uploaded files (avatars, place photos) are stored by filename only;
// build the full static URL the backend serves them from.
export const getImageUrl = (filename) =>
  filename ? `${BASE_URL}/uploads/${filename}` : null;

// Attach token automatically if present
Api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, clear the stale session so the app
// doesn't keep showing a "logged in" UI that the backend has already rejected.
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---------------- USER APIs ----------------

// Create user (multipart/form-data if image upload)
export const createUser = (data) => {
  return Api.post("/api/users/create", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Login
export const loginUser = (data) => Api.post("/api/users/login", data);

// Get all users (admin only)
export const getAllUser = () => Api.get("/api/users/getAll");

// Get user by ID
export const getUserById = (id) => Api.get(`/api/users/getUserById/${id}`);

// Update user by ID (multipart/form-data if image upload)
export const updateUserById = (id, data) => {
  return Api.put(`/api/users/updateUserById/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Delete user by ID
export const deleteUserById = (id) => Api.delete(`/api/users/deleteUserById/${id}`);

// Get / update the logged-in user's own profile
export const getProfile = () => Api.get("/api/users/profile");
export const updateProfile = (data) => {
  return Api.put("/api/users/profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Password change (logged in) / recovery (logged out)
export const changePassword = (data) => Api.put("/api/users/change-password", data);
export const forgotPassword = (data) => Api.post("/api/users/forgot-password", data);
export const resetPassword = (token, data) =>
  Api.post(`/api/users/reset-password/${token}`, data);




// ---------------- PLACE APIs ----------------

// Get all places
export const getAllPlaces = () => Api.get("/api/places/getAllPlaces");

// Add a new place (multipart/form-data for image upload)
export const addPlace = (data) => {
  return Api.post("/api/places/addPlace", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Get place by ID
export const getPlaceById = (id) => Api.get(`/api/places/getPlaceById/${id}`);

// Update place by ID (multipart/form-data if image upload)
export const updatePlaceById = (id, data) => {
  return Api.put(`/api/places/updatePlace/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const addReview = (data) => Api.post("/api/reviews/addReview", data, {
  headers: { "Content-Type": "application/json" },
});
export const getReviews = (placeId) => Api.get(`/api/reviews/getReviews/${placeId}`);
export const updateReview = (id, data) => Api.put(`/api/reviews/updateReview/${id}`, data);
export const deleteReview = (id) => Api.delete(`/api/reviews/deleteReview/${id}`);


// Delete place by ID
export const deletePlaceById = (id) => Api.delete(`/api/places/deletePlace/${id}`);


// ---------------- FAVORITE APIs ----------------

export const addFavorite = (placeId) => Api.post("/api/favorites/add", { placeId });
export const removeFavorite = (placeId) => Api.delete(`/api/favorites/remove/${placeId}`);
export const getMyFavorites = () => Api.get("/api/favorites/mine");
export const getMyFavoriteIds = () => Api.get("/api/favorites/mine/ids");


// ---------------- FEEDBACK APIs ----------------

export const submitFeedback = (data) => Api.post("/api/feedback/add", data);
export const getAllFeedback = () => Api.get("/api/feedback/all");


// ---------------- NOTIFICATION APIs ----------------

export const getMyNotifications = () => Api.get("/api/notifications/mine");
export const markNotificationRead = (id) => Api.put(`/api/notifications/mine/${id}/read`);
export const markAllNotificationsRead = () => Api.put("/api/notifications/mine/read-all");


// ---------------- MESSAGE APIs ----------------

export const sendMessage = (receiverId, content) =>
  Api.post("/api/messages/send", { receiverId, content });
export const getConversations = () => Api.get("/api/messages/conversations");
export const getConversation = (otherUserId) =>
  Api.get(`/api/messages/conversation/${otherUserId}`);
export const updateMessage = (id, content) => Api.put(`/api/messages/update/${id}`, { content });
export const deleteMessage = (id) => Api.delete(`/api/messages/delete/${id}`);
