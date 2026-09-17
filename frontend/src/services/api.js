import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env?.VITE_API_URL || "https://beyondcampus.onrender.com/api/v1",
    withCredentials: true
});

// Automatically attach Authorization Bearer token to all outgoing requests if present
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("beyondcampus_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;