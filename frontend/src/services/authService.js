import api from "./api";

export const registerUser = async (formData) => {
    const response = await api.post("/users/register", formData);

    return response.data;
};