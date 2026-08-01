import axios from "axios";

// ==============================================================================
// AXIOS CLIENT INSTANCES
// ==============================================================================

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API,
});

const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API,
});

const workoutApi = axios.create({
  baseURL: import.meta.env.VITE_WORKOUT_API,
});

const nutritionApi = axios.create({
  baseURL: import.meta.env.VITE_NUTRITION_API,
});

const TrackingApi = axios.create({
  baseURL: import.meta.env.VITE_TRACKING_API,
});

// ==============================================================================
// REQUEST INTERCEPTORS
// ==============================================================================

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

[userApi, workoutApi, nutritionApi, TrackingApi].forEach((api) => {
  api.interceptors.request.use(attachToken, (error) => Promise.reject(error));
});

export { authApi, userApi, workoutApi, nutritionApi, TrackingApi };
