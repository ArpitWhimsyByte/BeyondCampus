import api from "./api";

export const registerUser = async (formData) => {
    const response = await api.post("/users/register", formData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await api.post("/users/login", credentials);
    return response.data;
};

export const logoutUser = async () => {
    const response = await api.post("/users/logout");
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/users/current-user");
    return response.data;
};

export const updateCoverImage = async (formData) => {
    const response = await api.patch("/users/cover-image", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

export const updateAvatar = async (formData) => {
    const response = await api.patch("/users/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};