import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { deletePost, toggleLikePost, updatePost } from "../services/postService";
import { getCommentsByPostId, addComment, updateComment, deleteComment } from "../services/commentService";
import { useAuth } from "../context/AuthContext";

function PostCard({ post, onPostDeleted, onPostUpdated }) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if current user owns this post
    const isAuthor = useMemo(() => {
        if (!currentUser?._id || !post?.author) return false;
        const authorId = post.author._id || post.author;
        return String(currentUser._id) === String(authorId);
    }, [currentUser?._id, post.author]);

    // Check if the authenticated user has liked this post
    const isLikedInitially = useMemo(() => {
        if (!currentUser?._id || !Array.isArray(post.likes)) return false;
        return post.likes.some((item) => {
            const id = item?._id || item;
            return String(id) === String(currentUser._id);
        });
    }, [post.likes, currentUser?._id]);

    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(isLikedInitially);
    const [isLiking, setIsLiking] = useState(false);
    const [likeError, setLikeError] = useState("");
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedToast, setCopiedToast] = useState(false);

    // Inline post edit state
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editPostContent, setEditPostContent] = useState(post.content || "");
    const [isSavingPost, setIsSavingPost] = useState(false);

    // Comment author actions state
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const [isSavingComment, setIsSavingComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    // Sync when post.likes or content changes
    useEffect(() => {
        setIsLiked(isLikedInitially);
        setLikesCount(post.likes?.length || 0);
        setEditPostContent(post.content || "");
    }, [isLikedInitially, post.likes, post.content]);

    const formatDate = (dateString) => {
        if (!dateString) return "Recently";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHr = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHr / 24);

        if (diffSec < 60) return "Just now";
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHr < 24) return `${diffHr}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const handleLike = async () => {
        if (!currentUser?._id) {
            navigate("/login", { state: { from: location } });
            return;
        }

        if (isLiking) return; // Prevent duplicate rapid requests

        const prevLiked = isLiked;
        const prevCount = likesCount;

        // Immediate optimistic UI update
        const nextLiked = !prevLiked;
        const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);
        setIsLiked(nextLiked);
        setLikesCount(nextCount);
        setIsLiking(true);
        setLikeError("");

        try {
            const response = await toggleLikePost(post._id);
            const data = response?.data;
            if (data) {
                if (typeof data.isLiked === "boolean") {
                    setIsLiked(data.isLiked);
                }
                if (typeof data.likesCount === "number") {
                    setLikesCount(data.likesCount);
                }
                if (onPostUpdated) {
                    onPostUpdated(post._id, data);
                }
            }
        } catch (err) {
            console.error("Failed to toggle like:", err);
            // Revert optimistic update on failure
            setIsLiked(prevLiked);
            setLikesCount(prevCount);
            setLikeError(err.response?.data?.message || "Like action failed");
            setTimeout(() => setLikeError(""), 3500);
        } finally {
            setIsLiking(false);
        }
    };

    const toggleComments = async () => {
        const nextState = !showComments;
        setShowComments(nextState);

        if (nextState && comments.length === 0) {
            try {
                setCommentsLoading(true);
                const response = await getCommentsByPostId(post._id);
                if (response.data) {
                    setComments(response.data);
                }
            } catch (err) {
                console.error("Error fetching comments:", err);
            } finally {
                setCommentsLoading(false);
            }
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmittingComment(true);
            const response = await addComment(post._id, newComment.trim());
            if (response.data) {
                setComments([response.data, ...comments]);
                setNewComment("");
            }
        } catch (err) {
            console.error("Error adding comment:", err);
        } finally {
            setSubmittingComment(false);
        }
    };

    // Save inline post edit
    const handleSavePostEdit = async () => {
        if (!editPostContent.trim()) return;
        try {
            setIsSavingPost(true);
            const res = await updatePost(post._id, { content: editPostContent.trim() });
            const updated = res?.data || res;
            setIsEditingPost(false);
            if (onPostUpdated) {
                onPostUpdated(post._id, { ...post, content: updated?.content || editPostContent.trim() });
            }
        } catch (err) {
            console.error("Failed to update post:", err);
            alert(err.response?.data?.message || "Failed to update broadcast.");
        } finally {
            setIsSavingPost(false);
        }
    };

    // Author post delete
    const handleDelete = async () => {
        if (!isAuthor) return;
        if (!window.confirm("Are you sure you want to permanently delete this post?")) return;

        try {
            setIsDeleting(true);
            await deletePost(post._id);
            if (onPostDeleted) {
                onPostDeleted(post._id);
            }
        } catch (err) {
            console.error("Error deleting post:", err);
            alert(err.response?.data?.message || "Failed to delete post");
            setIsDeleting(false);
        }
    };

    // Comment edit & delete handlers
    const handleStartEditComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditCommentContent(comment.content);
    };

    const handleSaveCommentEdit = async (commentId) => {
        if (!editCommentContent.trim()) return;
        try {
            setIsSavingComment(true);
            const res = await updateComment(commentId, editCommentContent.trim());
            const updated = res?.data || res;
            setComments((prev) =>
                prev.map((c) =>
                    c._id === commentId
                        ? { ...c, content: updated?.content || editCommentContent.trim() }
                        : c
                )
            );
            setEditingCommentId(null);
            setEditCommentContent("");
        } catch (err) {
            console.error("Failed to update comment:", err);
            alert(err.response?.data?.message || "Failed to update comment.");
        } finally {
            setIsSavingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment permanently?")) return;
        try {
            setDeletingCommentId(commentId);
            await deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (err) {
            console.error("Failed to delete comment:", err);
            alert(err.response?.data?.message || "Failed to delete comment.");
        } finally {
            setDeletingCommentId(null);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard?.writeText(url);
        setCopiedToast(true);
        setMenuOpen(false);
        setTimeout(() => setCopiedToast(false), 2000);
    };

    const author = post.author || {};
    const authorName = author.fullname || author.username || "Collegiate Builder";
    const authorUsername = author.username || "builder";
    const authorProfilePath = `/profile/${authorUsername || author._id || ""}`;
    const authorInitials = authorName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <article className="bg-gradient-to-b from-[#18181d] to-[#131317] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-5 sm:p-6 shadow-xl transition-all duration-300 relative">
            
            {/* Copied toast notice */}
            {copiedToast && (
                <div className="absolute top-4 right-4 z-30 px-3 py-1 rounded-md bg-[#fab818] text-slate-950 text-xs font-mono font-bold shadow-lg">
                    Link copied!
                </div>
            )}

            <div className="space-y-4">
                
                {/* Author Info Header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            to={authorProfilePath}
                            className="shrink-0 hover:opacity-85 transition cursor-pointer"
                            title={`View ${authorName}'s profile`}
                        >
                            {author.avatar ? (
                                <img
                                    src={author.avatar}
                                    alt={authorName}
                                    className="w-10 h-10 rounded-full object-cover border border-white/[0.1] hover:border-[#fab818] transition"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-zinc-800 text-[#fab818] font-mono font-bold text-xs flex items-center justify-center border border-white/[0.1] hover:border-[#fab818] transition">
                                    {authorInitials}
                                </div>
                            )}
                        </Link>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Link
                                    to={authorProfilePath}
                                    className="text-sm font-bold text-white hover:text-[#fab818] transition cursor-pointer"
                                    title={`View ${authorName}'s profile`}
                                >
                                    {authorName}
                                </Link>
                                <Link
                                    to={authorProfilePath}
                                    className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                                >
                                    @{authorUsername}
                                </Link>
                                <span className="text-[9px] font-mono uppercase bg-white/[0.05] border border-white/[0.08] text-zinc-300 px-2 py-0.5 rounded-full">
                                    Collegiate
                                </span>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-500">
                                {formatDate(post.createdAt)}
                            </span>
                        </div>
                    </div>

                    {/* Options Menu Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>

                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                                <div className="absolute right-0 mt-1 w-36 bg-[#141418] border border-white/[0.1] rounded-xl shadow-2xl py-1 z-30">
                                    <Link
                                        to={`/post/${post._id}`}
                                        className="block w-full text-left px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-[#fab818] transition cursor-pointer"
                                    >
                                        View Details
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition cursor-pointer"
                                    >
                                        Copy Link
                                    </button>
                                    {isAuthor && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    setIsEditingPost(true);
                                                    setEditPostContent(post.content || "");
                                                }}
                                                className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-[#fab818] transition cursor-pointer"
                                            >
                                                Edit Post
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isDeleting}
                                                onClick={handleDelete}
                                                className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
                                            >
                                                {isDeleting ? "Deleting..." : "Delete Post"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Post Title & Content */}
                <div className="space-y-2">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                        <Link to={`/post/${post._id}`} className="hover:text-[#fab818] transition cursor-pointer">
                            {post.title}
                        </Link>
                    </h2>
                    {isEditingPost ? (
                        <div className="space-y-2 pt-1">
                            <textarea
                                rows={4}
                                value={editPostContent}
                                onChange={(e) => setEditPostContent(e.target.value)}
                                className="w-full bg-[#0d0d10] border border-zinc-700 focus:border-[#fab818] p-3 text-xs sm:text-sm text-white font-mono focus:outline-none transition resize-y leading-relaxed rounded-xl"
                                placeholder="Edit your broadcast content..."
                            />
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPost(false)}
                                    className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isSavingPost || !editPostContent.trim()}
                                    onClick={handleSavePostEdit}
                                    className="px-4 py-1.5 text-xs font-mono font-bold bg-[#fab818] hover:bg-[#ffdb24] text-slate-950 rounded-lg disabled:opacity-50 cursor-pointer"
                                >
                                    {isSavingPost ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                            {post.content}
                        </p>
                    )}
                </div>

                {/* Attached Media Container */}
                {post.image && (
                    <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black/40 max-h-[420px] flex items-center justify-center">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full max-h-[420px] object-cover hover:scale-[1.01] transition duration-300"
                            loading="lazy"
                        />
                    </div>
                )}

                {/* Engagement & Actions Bar */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Like Button */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={isLiking}
                                onClick={handleLike}
                                title={isLiked ? "Unlike broadcast" : "Like broadcast"}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                    isLiking ? "opacity-70 cursor-not-allowed" : ""
                                } ${
                                    isLiked
                                        ? "text-rose-400 bg-rose-500/10 border border-rose-500/30 shadow-xs shadow-rose-500/10"
                                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                                }`}
                            >
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                        isLiking ? "scale-90 opacity-70" : ""
                                    } ${
                                        isLiked ? "fill-rose-500 text-rose-500 scale-105" : "text-zinc-400"
                                    }`}
                                    fill={isLiked ? "currentColor" : "none"}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="font-bold">{likesCount}</span>
                            </button>
                            {likeError && (
                                <span className="text-[10px] text-rose-400 font-mono tracking-tight animate-fade-in">
                                    {likeError}
                                </span>
                            )}
                        </div>

                        {/* Comments Button */}
                        <button
                            type="button"
                            onClick={toggleComments}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Comments</span>
                        </button>

                        {/* Share Button */}
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span className="hidden sm:inline">Share</span>
                        </button>
                    </div>

                    {/* Bookmark Button */}
                    <button
                        type="button"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        title={isBookmarked ? "Saved" : "Bookmark"}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isBookmarked
                                ? "text-[#fab818] bg-[#fab818]/10"
                                : "text-zinc-500 hover:text-white hover:bg-white/[0.05]"
                        }`}
                    >
                        <svg
                            className={`w-4 h-4 ${isBookmarked ? "fill-[#fab818]" : ""}`}
                            fill={isBookmarked ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>

                {/* Inline Comments Drawer */}
                {showComments && (
                    <div className="pt-4 border-t border-white/[0.06] space-y-3">
                        <form onSubmit={handleAddComment} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Contribute to this discussion..."
                                className="flex-1 h-9 px-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.08] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#fab818] transition"
                            />
                            <button
                                type="submit"
                                disabled={submittingComment || !newComment.trim()}
                                className="px-4 h-9 rounded-xl bg-gradient-to-r from-[#fab818] to-[#f59e0b] hover:from-[#ffc43a] hover:to-[#fbbf24] disabled:bg-zinc-800 disabled:text-zinc-600 text-slate-950 font-bold text-xs uppercase transition cursor-pointer"
                            >
                                {submittingComment ? "..." : "Reply"}
                            </button>
                        </form>

                        {/* Comments List */}
                        {commentsLoading ? (
                            <p className="text-xs font-mono text-zinc-500 text-center py-2">Loading discussion...</p>
                        ) : comments.length === 0 ? (
                            <p className="text-xs font-mono text-zinc-500 text-center py-2">No comments yet</p>
                        ) : (
                            <div className="space-y-2 pt-1">
                                {comments.map((comment) => {
                                    const isCommentOwner = Boolean(
                                        currentUser?._id &&
                                        (String(currentUser._id) === String(comment.createdBy?._id || comment.createdBy))
                                    );
                                    const isEditingThisComment = editingCommentId === comment._id;

                                    return (
                                        <div key={comment._id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-[#fab818] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-white/[0.08]">
                                                        {comment.createdBy?.fullname?.[0] || comment.createdBy?.username?.[0] || "U"}
                                                    </div>
                                                    <span className="font-bold text-white">
                                                        {comment.createdBy?.fullname || comment.createdBy?.username || "Student"}
                                                    </span>
                                                    {isCommentOwner && (
                                                        <span className="text-[9px] font-mono uppercase bg-[#fab818]/10 text-[#fab818] border border-[#fab818]/30 px-1.5 py-0.2">
                                                            YOU
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-mono text-zinc-500">
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>

                                                {isCommentOwner && !isEditingThisComment && (
                                                    <div className="flex items-center gap-2 font-mono text-[11px]">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartEditComment(comment)}
                                                            className="text-zinc-400 hover:text-[#fab818] hover:underline cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                        <span className="text-zinc-600">·</span>
                                                        <button
                                                            type="button"
                                                            disabled={deletingCommentId === comment._id}
                                                            onClick={() => handleDeleteComment(comment._id)}
                                                            className="text-zinc-400 hover:text-rose-400 hover:underline cursor-pointer disabled:opacity-50"
                                                        >
                                                            {deletingCommentId === comment._id ? "..." : "Delete"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {isEditingThisComment ? (
                                                <div className="space-y-2 pt-1">
                                                    <input
                                                        type="text"
                                                        value={editCommentContent}
                                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                                        className="w-full h-8 px-2.5 rounded-lg bg-black/50 border border-zinc-700 focus:border-[#fab818] text-xs text-white font-mono focus:outline-none"
                                                    />
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCommentId(null)}
                                                            className="px-2 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isSavingComment || !editCommentContent.trim()}
                                                            onClick={() => handleSaveCommentEdit(comment._id)}
                                                            className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-[#fab818] text-slate-950 rounded cursor-pointer disabled:opacity-50"
                                                        >
                                                            {isSavingComment ? "Saving..." : "Save"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-zinc-300 leading-relaxed font-normal pl-8">
                                                    {comment.content}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </article>
    );
}

export default PostCard;
