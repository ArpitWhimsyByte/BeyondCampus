import api from "./api";

// Fetch all comments for a post
export const getCommentsByPostId = async (postId) => {
    const response = await api.get(`/comments/${postId}`);
    return response.data;
};

// Add a new comment to a post
export const addComment = async (postId, content) => {
    const response = await api.post(`/comments/${postId}`, { content });
    return response.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
};

// Update a comment
export const updateComment = async (commentId, content) => {
    const response = await api.patch(`/comments/${commentId}`, { content });
    return response.data;
};

