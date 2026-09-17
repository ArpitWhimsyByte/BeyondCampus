import api from "./api";

// Fetch all posts for the community feed
export const getAllPosts = async () => {
    const response = await api.get("/posts/getAllPosts");
    return response.data;
};

// Create a new post with multipart/form-data (title, content, optional image)
export const createPost = async (formData) => {
    const response = await api.post("/posts/createpost", formData);
    return response.data;
};

// Delete a post by postId
export const deletePost = async (postId) => {
    const response = await api.delete(`/posts/deletePost/${postId}`);
    return response.data;
};

// Get a single post details
export const getSinglePost = async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
};

// Get current user's posts
export const getMyPosts = async () => {
    const response = await api.get("/posts/my-posts");
    return response.data;
};

