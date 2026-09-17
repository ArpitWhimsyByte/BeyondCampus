import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getSinglePost, updatePost, deletePost, toggleLikePost } from "../services/postService";
import { getCommentsByPostId, addComment, updateComment, deleteComment } from "../services/commentService";
import { useAuth } from "../context/AuthContext";
import mascotImg from "../assets/husky_mascot.png";

function PostDetails() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    // Post state
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Likes state
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // Comments state
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Post Author Controls state
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editPostContent, setEditPostContent] = useState("");
    const [isUpdatingPost, setIsUpdatingPost] = useState(false);
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

    // Comment Author Controls state
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const [isUpdatingComment, setIsUpdatingComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    // Status notifications / toasts
    const [statusToast, setStatusToast] = useState("");
    const [isImageZoomed, setIsImageZoomed] = useState(false);

    const showToast = (msg) => {
        setStatusToast(msg);
        setTimeout(() => setStatusToast(""), 3500);
    };

    // Load Post and its Comments
    useEffect(() => {
        let isMounted = true;

        const loadPostAndComments = async () => {
            if (!postId) {
                setError("Post ID is missing");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                // 1. Fetch Post Details
                const postRes = await getSinglePost(postId);
                const postData = postRes?.data || postRes;

                if (!postData || !postData._id) {
                    throw new Error("Post not found");
                }

                if (isMounted) {
                    setPost(postData);
                    setEditPostContent(postData.content || "");
                    
                    const initialLikes = Array.isArray(postData.likes) ? postData.likes.length : 0;
                    setLikesCount(initialLikes);

                    // Determine if current user liked from backend data
                    const hasLikedInBackend = Boolean(
                        Array.isArray(postData.likes) &&
                        currentUser?._id &&
                        postData.likes.some((id) => {
                            const rawId = id?._id || id;
                            return String(rawId) === String(currentUser._id);
                        })
                    );

                    setIsLiked(hasLikedInBackend);
                }

                // 2. Fetch Comments
                try {
                    setCommentsLoading(true);
                    const commentsRes = await getCommentsByPostId(postId);
                    const commentsData = commentsRes?.data || commentsRes || [];
                    if (isMounted) {
                        setComments(Array.isArray(commentsData) ? commentsData : []);
                    }
                } catch (cErr) {
                    console.error("Error fetching comments:", cErr);
                } finally {
                    if (isMounted) setCommentsLoading(false);
                }

            } catch (err) {
                console.error("Error loading post:", err);
                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Unable to locate this broadcast on campus servers."
                    );
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadPostAndComments();

        return () => {
            isMounted = false;
        };
    }, [postId, currentUser?._id]);

    // Check if current logged-in user is author of post
    const isPostAuthor = useMemo(() => {
        if (!currentUser || !post?.author) return false;
        const authorId = post.author._id || post.author;
        return String(currentUser._id) === String(authorId);
    }, [currentUser, post]);

    // Format timestamps
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

    const formatFullTimestamp = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Toggle Like Handler
    const handleLikeToggle = async () => {
        if (!currentUser?._id) {
            navigate("/login", { state: { from: location } });
            return;
        }

        if (isLiking) return; // Prevent duplicate in-flight requests

        const prevLiked = isLiked;
        const prevCount = likesCount;

        // Immediate optimistic update
        const nextLiked = !prevLiked;
        const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);
        setIsLiked(nextLiked);
        setLikesCount(nextCount);
        setIsLiking(true);

        try {
            const res = await toggleLikePost(postId);
            const data = res?.data;
            if (data) {
                if (typeof data.isLiked === "boolean") {
                    setIsLiked(data.isLiked);
                }
                if (typeof data.likesCount === "number") {
                    setLikesCount(data.likesCount);
                }
                if (Array.isArray(data.likes)) {
                    setPost((prev) => (prev ? { ...prev, likes: data.likes } : prev));
                }
            }
        } catch (err) {
            console.error("Failed to toggle like:", err);
            // Revert on error
            setIsLiked(prevLiked);
            setLikesCount(prevCount);
            showToast(err.response?.data?.message || "Like action failed. Please try again.");
        } finally {
            setIsLiking(false);
        }
    };

    // Copy Post Link
    const handleCopyLink = () => {
        const canonicalUrl = window.location.href;
        navigator.clipboard?.writeText(canonicalUrl);
        showToast("Broadcast link copied to clipboard!");
    };

    // Save Updated Post Content
    const handleSavePostEdit = async () => {
        if (!editPostContent.trim()) {
            showToast("Content cannot be empty.");
            return;
        }

        try {
            setIsUpdatingPost(true);
            const res = await updatePost(postId, { content: editPostContent.trim() });
            const updated = res?.data || res;

            if (updated) {
                setPost((prev) => ({
                    ...prev,
                    content: updated.content || editPostContent.trim(),
                    updatedAt: updated.updatedAt || new Date().toISOString(),
                }));
                setIsEditingPost(false);
                showToast("Broadcast updated successfully!");
            }
        } catch (err) {
            console.error("Failed to update post:", err);
            showToast(err.response?.data?.message || "Failed to update broadcast.");
        } finally {
            setIsUpdatingPost(false);
        }
    };

    // Delete Post Handler
    const handleDeletePost = async () => {
        try {
            setIsDeletingPost(true);
            await deletePost(postId);
            showToast("Post deleted. Redirecting to feed...");
            setTimeout(() => {
                navigate("/");
            }, 1200);
        } catch (err) {
            console.error("Failed to delete post:", err);
            showToast(err.response?.data?.message || "Failed to delete post.");
            setIsDeletingPost(false);
            setConfirmDeleteModal(false);
        }
    };

    // Submit New Comment
    const handleCreateComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!currentUser) {
            navigate("/login");
            return;
        }

        try {
            setSubmittingComment(true);
            const res = await addComment(postId, newComment.trim());
            const created = res?.data || res;

            if (created) {
                // Populate createdBy with current user for instant display
                const populatedComment = {
                    ...created,
                    createdBy: {
                        _id: currentUser._id,
                        fullname: currentUser.fullname,
                        username: currentUser.username,
                        avatar: currentUser.avatar,
                    },
                };

                setComments((prev) => [populatedComment, ...prev]);
                setNewComment("");
                showToast("Reply submitted to discussion!");
            }
        } catch (err) {
            console.error("Error creating comment:", err);
            showToast(err.response?.data?.message || "Failed to post comment.");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Start Editing Comment
    const handleStartEditComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditCommentContent(comment.content);
    };

    // Save Edited Comment
    const handleSaveCommentEdit = async (commentId) => {
        if (!editCommentContent.trim()) {
            showToast("Comment cannot be empty.");
            return;
        }

        try {
            setIsUpdatingComment(true);
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
            showToast("Comment updated successfully!");
        } catch (err) {
            console.error("Failed to update comment:", err);
            showToast(err.response?.data?.message || "Failed to update comment.");
        } finally {
            setIsUpdatingComment(false);
        }
    };

    // Delete Comment Handler
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment permanently?")) return;

        try {
            setDeletingCommentId(commentId);
            await deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            showToast("Comment removed.");
        } catch (err) {
            console.error("Failed to delete comment:", err);
            showToast(err.response?.data?.message || "Failed to delete comment.");
        } finally {
            setDeletingCommentId(null);
        }
    };

    const author = post?.author || {};
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
        <div className="min-h-screen bg-[#08080a] text-zinc-100 selection:bg-[#fab818] selection:text-slate-950 font-sans pb-24">
            <Navbar />

            {/* Status Toast Banner */}
            {statusToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#111114] border border-[#fab818] text-[#fab818] px-4 py-2.5 font-mono text-xs shadow-2xl flex items-center gap-3 animate-fade-in">
                    <span className="w-2 h-2 bg-[#fab818] animate-pulse" />
                    <span>{statusToast}</span>
                </div>
            )}

            {/* Breadcrumb Navigation Strip */}
            <div className="border-b border-zinc-800/80 bg-[#0d0d10]/95 sticky top-16 z-30 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between font-mono text-xs text-zinc-400">
                    <div className="flex items-center gap-2 sm:gap-3 truncate">
                        <Link
                            to="/"
                            className="text-zinc-300 hover:text-[#fab818] flex items-center gap-1.5 transition uppercase tracking-wider shrink-0"
                        >
                            <span>←</span>
                            <span className="hidden sm:inline">CAMPUS</span> FEED
                        </Link>
                        <span className="text-zinc-700">/</span>
                        <span className="text-zinc-500 uppercase truncate">
                            BROADCAST // {postId?.slice(-8) || "DETAILS"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="px-2.5 py-1 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/60 text-zinc-300 hover:text-[#fab818] transition flex items-center gap-1.5 text-[11px]"
                            title="Copy link to broadcast"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">COPY LINK</span>
                        </button>

                        {isPostAuthor && (
                            <button
                                type="button"
                                onClick={() => setConfirmDeleteModal(true)}
                                className="px-2.5 py-1 border border-rose-900/60 hover:border-rose-600 bg-rose-950/30 text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5 text-[11px]"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>DELETE</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                {/* Loading State */}
                {loading ? (
                    <div className="space-y-6">
                        <div className="bg-[#111114] border border-zinc-800 p-6 space-y-4 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-zinc-800" />
                                <div className="space-y-2 flex-1">
                                    <div className="w-48 h-4 bg-zinc-800" />
                                    <div className="w-28 h-3 bg-zinc-800/60" />
                                </div>
                            </div>
                            <div className="w-3/4 h-6 bg-zinc-800" />
                            <div className="space-y-2">
                                <div className="w-full h-4 bg-zinc-800/50" />
                                <div className="w-5/6 h-4 bg-zinc-800/50" />
                                <div className="w-2/3 h-4 bg-zinc-800/50" />
                            </div>
                            <div className="w-full h-64 bg-zinc-900" />
                        </div>
                    </div>
                ) : error ? (
                    /* Error State */
                    <div className="bg-[#111114] border border-rose-900/60 p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto my-12 shadow-2xl">
                        <div className="w-12 h-12 mx-auto bg-rose-950/50 border border-rose-800 text-rose-400 flex items-center justify-center font-mono font-bold text-lg">
                            !
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                                BROADCAST NOT FOUND
                            </h2>
                            <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto">
                                {error}
                            </p>
                        </div>
                        <div className="pt-2">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fab818] hover:bg-[#e0a515] text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition shadow-lg"
                            >
                                <span>←</span> RETURN TO CAMPUS FEED
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Main Two-Column View */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Primary Column: Post Broadcast & Discussion */}
                        <div className="lg:col-span-8 space-y-6">
                            
                            {/* Post Broadcast Card */}
                            <article className="bg-[#111114] border border-zinc-800 relative shadow-xl">
                                
                                {/* Top Diagnostic Ribbon */}
                                <div className="px-5 sm:px-6 py-2 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500" />
                                        <span>CANONICAL BROADCAST</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span>ID // {postId}</span>
                                        <span className="hidden sm:inline text-zinc-700">|</span>
                                        <span className="hidden sm:inline text-zinc-400">{formatDate(post.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-7 space-y-5">
                                    
                                    {/* Author Profile Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            {/* Square Avatar linked to Profile */}
                                            <Link
                                                to={authorProfilePath}
                                                className="relative shrink-0 hover:opacity-85 transition cursor-pointer"
                                                title={`View ${authorName}'s profile`}
                                            >
                                                {author.avatar ? (
                                                    <img
                                                        src={author.avatar}
                                                        alt={authorName}
                                                        className="w-12 h-12 object-cover border border-zinc-700 hover:border-[#fab818] bg-zinc-900 transition"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 hover:border-[#fab818] text-[#fab818] font-mono font-bold text-sm flex items-center justify-center transition">
                                                        {authorInitials}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#111114]" />
                                            </Link>

                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Link
                                                        to={authorProfilePath}
                                                        className="text-sm sm:text-base font-bold text-white hover:text-[#fab818] transition flex items-center gap-1.5 cursor-pointer"
                                                        title={`View ${authorName}'s profile`}
                                                    >
                                                        {authorName}
                                                    </Link>
                                                    <Link
                                                        to={authorProfilePath}
                                                        className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                                                    >
                                                        @{authorUsername}
                                                    </Link>
                                                    {isPostAuthor ? (
                                                        <span className="text-[9px] font-mono uppercase bg-[#fab818]/10 text-[#fab818] border border-[#fab818]/30 px-1.5 py-0.5 font-bold">
                                                            AUTHOR // YOU
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-mono uppercase bg-zinc-900 text-zinc-300 border border-zinc-700 px-1.5 py-0.5">
                                                            COLLEGIATE BUILDER
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-mono text-zinc-500">
                                                    Published on {formatFullTimestamp(post.createdAt)}
                                                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                                                        <span className="text-zinc-600"> (edited)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Author Controls */}
                                        {isPostAuthor && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingPost(!isEditingPost)}
                                                    className={`px-3 py-1 text-xs font-mono border transition cursor-pointer ${
                                                        isEditingPost
                                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                                            : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-[#fab818] hover:text-[#fab818]"
                                                    }`}
                                                >
                                                    {isEditingPost ? "CANCEL" : "EDIT POST"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDeleteModal(true)}
                                                    className="px-3 py-1 text-xs font-mono border border-rose-900/60 hover:border-rose-600 bg-rose-950/30 text-rose-400 hover:text-rose-300 transition cursor-pointer flex items-center gap-1"
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Post Title */}
                                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight pt-1">
                                        {post.title}
                                    </h1>

                                    {/* Post Content / Edit Form */}
                                    {isEditingPost ? (
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                                                <span>EDIT BROADCAST CONTENT</span>
                                                <span className="text-[10px] text-zinc-500">MARKDOWN SUPPORTED</span>
                                            </div>
                                            <textarea
                                                rows={7}
                                                value={editPostContent}
                                                onChange={(e) => setEditPostContent(e.target.value)}
                                                className="w-full bg-[#09090b] border border-zinc-700 focus:border-[#fab818] p-3 text-sm text-white font-mono focus:outline-none transition resize-y leading-relaxed"
                                                placeholder="Write your updated post content..."
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditingPost(false);
                                                        setEditPostContent(post.content || "");
                                                    }}
                                                    className="px-4 py-1.5 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isUpdatingPost || !editPostContent.trim()}
                                                    onClick={handleSavePostEdit}
                                                    className="px-4 py-1.5 bg-[#fab818] hover:bg-[#e0a515] disabled:bg-zinc-800 disabled:text-zinc-600 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition"
                                                >
                                                    {isUpdatingPost ? "SAVING..." : "SAVE CHANGES"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal whitespace-pre-line break-words pt-1">
                                            {post.content}
                                        </div>
                                    )}

                                    {/* Attached Media Container */}
                                    {post.image && (
                                        <div className="pt-2">
                                            <div className="border border-zinc-800 bg-black/80 p-1 group relative overflow-hidden">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    onClick={() => setIsImageZoomed(true)}
                                                    className="w-full max-h-[540px] object-contain cursor-zoom-in group-hover:opacity-95 transition"
                                                    loading="lazy"
                                                />
                                                <div className="absolute bottom-3 right-3 bg-black/80 border border-zinc-800 px-2 py-1 text-[10px] font-mono text-zinc-400 pointer-events-none">
                                                    CLICK TO INSPECT FULL-RES
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Engagement Action Strip */}
                                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-3 font-mono text-xs">
                                        <div className="flex items-center gap-3">
                                            {/* Like / Unlike Button */}
                                            <button
                                                type="button"
                                                disabled={isLiking}
                                                onClick={handleLikeToggle}
                                                title={isLiked ? "Unlike broadcast" : "Like broadcast"}
                                                className={`flex items-center gap-2 px-3.5 py-1.5 border transition cursor-pointer ${
                                                    isLiking ? "opacity-70 cursor-not-allowed" : ""
                                                } ${
                                                    isLiked
                                                        ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                                                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700"
                                                }`}
                                            >
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${
                                                        isLiking ? "scale-90 opacity-70" : ""
                                                    } ${isLiked ? "fill-rose-500 text-rose-500 scale-105" : "text-zinc-400"}`}
                                                    fill={isLiked ? "currentColor" : "none"}
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                    />
                                                </svg>
                                                <span className="font-bold">{likesCount}</span>
                                                <span className="hidden sm:inline text-zinc-500">
                                                    {likesCount === 1 ? "LIKE" : "LIKES"}
                                                </span>
                                            </button>

                                            {/* Discussion Counter Badge */}
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 bg-zinc-900/40 text-zinc-400">
                                                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span className="font-bold text-zinc-300">{comments.length}</span>
                                                <span className="hidden sm:inline text-zinc-500">
                                                    {comments.length === 1 ? "REPLY" : "REPLIES"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                                            <span>STATUS: PERSISTED // ATLAS</span>
                                        </div>
                                    </div>

                                </div>
                            </article>

                            {/* Discussions & Replies Section */}
                            <section className="bg-[#111114] border border-zinc-800 shadow-xl">
                                
                                {/* Section Banner */}
                                <div className="px-5 sm:px-6 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between font-mono text-xs">
                                    <div className="flex items-center gap-2 text-white font-bold tracking-wider uppercase">
                                        <span className="w-2 h-2 bg-[#fab818]" />
                                        <span>DISCUSSION THREAD</span>
                                        <span className="text-zinc-500 font-normal">({comments.length})</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 uppercase">
                                        STREAMING REPLIES
                                    </span>
                                </div>

                                <div className="p-5 sm:p-6 space-y-6">
                                    
                                    {/* Add Comment Box */}
                                    {currentUser ? (
                                        <form onSubmit={handleCreateComment} className="space-y-3 bg-zinc-950/60 border border-zinc-800/80 p-4">
                                            <div className="flex items-center gap-3">
                                                {currentUser.avatar ? (
                                                    <img
                                                        src={currentUser.avatar}
                                                        alt={currentUser.fullname || currentUser.username}
                                                        className="w-7 h-7 object-cover border border-zinc-700 bg-zinc-900"
                                                    />
                                                ) : (
                                                    <div className="w-7 h-7 bg-zinc-800 border border-zinc-700 text-[#fab818] font-mono font-bold text-xs flex items-center justify-center">
                                                        {currentUser.username?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                )}
                                                <div className="text-xs font-mono text-zinc-400">
                                                    Reply as <span className="text-white font-bold">{currentUser.fullname || currentUser.username}</span> <span className="text-zinc-500">(@{currentUser.username})</span>
                                                </div>
                                            </div>

                                            <textarea
                                                rows={3}
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Contribute your insight or answer to this collegiate discussion..."
                                                className="w-full bg-[#08080a] border border-zinc-800 focus:border-[#fab818] p-3 text-xs sm:text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none transition leading-relaxed resize-y"
                                            />

                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-[10px] font-mono text-zinc-500">
                                                    {newComment.length} characters
                                                </span>
                                                <button
                                                    type="submit"
                                                    disabled={submittingComment || !newComment.trim()}
                                                    className="px-5 py-2 bg-[#fab818] hover:bg-[#e0a515] disabled:bg-zinc-800 disabled:text-zinc-600 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer"
                                                >
                                                    {submittingComment ? (
                                                        <>
                                                            <span className="w-2.5 h-2.5 border-2 border-slate-950 border-t-transparent animate-spin" />
                                                            <span>SUBMITTING...</span>
                                                        </>
                                                    ) : (
                                                        <span>POST REPLY</span>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        /* Unauthenticated prompt */
                                        <div className="border border-dashed border-zinc-800 p-5 text-center space-y-3 bg-zinc-950/40">
                                            <p className="text-xs font-mono text-zinc-400">
                                                Sign in to join the conversation and reply to this broadcast.
                                            </p>
                                            <Link
                                                to="/login"
                                                className="inline-block px-4 py-1.5 bg-[#fab818] hover:bg-[#e0a515] text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition"
                                            >
                                                SIGN IN TO REPLY
                                            </Link>
                                        </div>
                                    )}

                                    {/* Comments Stream */}
                                    <div className="space-y-3 pt-2">
                                        {commentsLoading ? (
                                            <div className="py-8 text-center space-y-2 font-mono text-xs text-zinc-500">
                                                <div className="w-5 h-5 border-2 border-[#fab818] border-t-transparent animate-spin mx-auto" />
                                                <p>LOADING DISCUSSION THREAD...</p>
                                            </div>
                                        ) : comments.length === 0 ? (
                                            /* Empty Comments State */
                                            <div className="border border-zinc-800/80 bg-zinc-950/30 p-8 text-center space-y-3">
                                                <div className="w-10 h-10 mx-auto opacity-40">
                                                    <img src={mascotImg} alt="Husky" className="w-full h-full object-contain filter grayscale" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider">
                                                        NO REPLIES ON THIS THREAD YET
                                                    </p>
                                                    <p className="font-mono text-[11px] text-zinc-500">
                                                        Be the first collegiate builder to share your thoughts.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Render Comment List */
                                            comments.map((comment) => {
                                                const commentCreator = comment.createdBy || {};
                                                const creatorName = commentCreator.fullname || commentCreator.username || "Collegiate Builder";
                                                const creatorUsername = commentCreator.username || "builder";
                                                const commentAuthorProfilePath = `/profile/${creatorUsername || commentCreator._id || ""}`;
                                                const isCommentAuthor = Boolean(
                                                    currentUser &&
                                                    (String(currentUser._id) === String(commentCreator._id || commentCreator))
                                                );
                                                const isEditingThisComment = editingCommentId === comment._id;

                                                return (
                                                    <div
                                                        key={comment._id}
                                                        className="border border-zinc-800 bg-[#0d0d10] p-4 space-y-3 transition hover:border-zinc-700"
                                                    >
                                                        {/* Comment Header */}
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <Link
                                                                    to={commentAuthorProfilePath}
                                                                    className="shrink-0 hover:opacity-85 transition cursor-pointer"
                                                                    title={`View ${creatorName}'s profile`}
                                                                >
                                                                    {commentCreator.avatar ? (
                                                                        <img
                                                                            src={commentCreator.avatar}
                                                                            alt={creatorName}
                                                                            className="w-8 h-8 object-cover border border-zinc-700 hover:border-[#fab818] bg-zinc-900 transition shrink-0"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 hover:border-[#fab818] text-[#fab818] font-mono font-bold text-xs flex items-center justify-center transition shrink-0">
                                                                            {creatorName?.[0]?.toUpperCase() || "C"}
                                                                        </div>
                                                                    )}
                                                                </Link>
                                                                <div className="space-y-0.5">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <Link
                                                                            to={commentAuthorProfilePath}
                                                                            className="text-xs font-bold text-white hover:text-[#fab818] transition cursor-pointer"
                                                                            title={`View ${creatorName}'s profile`}
                                                                        >
                                                                            {creatorName}
                                                                        </Link>
                                                                        <Link
                                                                            to={commentAuthorProfilePath}
                                                                            className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                                                                        >
                                                                            @{creatorUsername}
                                                                        </Link>
                                                                        {isCommentAuthor && (
                                                                            <span className="text-[8px] font-mono uppercase bg-[#fab818]/10 text-[#fab818] border border-[#fab818]/30 px-1 py-0.2">
                                                                                YOU
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[10px] font-mono text-zinc-500 block">
                                                                        {formatDate(comment.createdAt)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Comment Author Actions */}
                                                            {isCommentAuthor && !isEditingThisComment && (
                                                                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStartEditComment(comment)}
                                                                        className="px-2 py-0.5 border border-zinc-800 text-zinc-400 hover:text-[#fab818] hover:border-[#fab818] transition"
                                                                    >
                                                                        EDIT
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={deletingCommentId === comment._id}
                                                                        onClick={() => handleDeleteComment(comment._id)}
                                                                        className="px-2 py-0.5 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900 transition"
                                                                    >
                                                                        {deletingCommentId === comment._id ? "..." : "DELETE"}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Comment Content / Inline Edit Form */}
                                                        {isEditingThisComment ? (
                                                            <div className="space-y-2 pt-1">
                                                                <textarea
                                                                    rows={3}
                                                                    value={editCommentContent}
                                                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                                                    className="w-full bg-[#08080a] border border-zinc-700 focus:border-[#fab818] p-2.5 text-xs text-white font-mono focus:outline-none transition leading-relaxed resize-y"
                                                                />
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditingCommentId(null);
                                                                            setEditCommentContent("");
                                                                        }}
                                                                        className="px-3 py-1 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-[11px] uppercase transition"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={isUpdatingComment || !editCommentContent.trim()}
                                                                        onClick={() => handleSaveCommentEdit(comment._id)}
                                                                        className="px-3 py-1 bg-[#fab818] hover:bg-[#e0a515] disabled:bg-zinc-800 disabled:text-zinc-600 text-slate-950 font-mono font-bold text-[11px] uppercase tracking-wider transition"
                                                                    >
                                                                        {isUpdatingComment ? "Saving..." : "Save"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed whitespace-pre-line pl-10">
                                                                {comment.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                </div>
                            </section>

                        </div>

                        {/* Secondary Column: Author Intelligence & Post Telemetry */}
                        <aside className="lg:col-span-4 space-y-6">
                            
                            {/* Author Telemetry Card */}
                            <div className="bg-[#111114] border border-zinc-800 p-5 space-y-4 shadow-xl">
                                <div className="border-b border-zinc-800 pb-3 flex items-center justify-between font-mono text-[11px]">
                                    <span className="text-zinc-400 uppercase font-bold tracking-wider">AUTHOR SPECS</span>
                                    <span className="text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-400" />
                                        ONLINE
                                    </span>
                                </div>

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
                                                className="w-14 h-14 object-cover border border-zinc-700 hover:border-[#fab818] bg-zinc-900 transition"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 hover:border-[#fab818] text-[#fab818] font-mono font-bold text-lg flex items-center justify-center transition">
                                                {authorInitials}
                                            </div>
                                        )}
                                    </Link>
                                    <div className="space-y-0.5">
                                        <Link
                                            to={authorProfilePath}
                                            className="text-sm font-bold text-white hover:text-[#fab818] transition block cursor-pointer leading-snug"
                                            title={`View ${authorName}'s profile`}
                                        >
                                            {authorName}
                                        </Link>
                                        <Link
                                            to={authorProfilePath}
                                            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition block cursor-pointer"
                                        >
                                            @{authorUsername}
                                        </Link>
                                        <p className="text-[10px] font-mono text-[#fab818] uppercase">
                                            BUILDER RANK // TIER 1
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {isPostAuthor ? (
                                        <Link
                                            to="/profile"
                                            className="block text-center w-full py-2 bg-zinc-900 border border-zinc-800 hover:border-[#fab818] text-[#fab818] font-mono text-xs uppercase tracking-wider transition font-bold"
                                        >
                                            MANAGE MY PROFILE
                                        </Link>
                                    ) : (
                                        <Link
                                            to={authorProfilePath}
                                            className="block text-center w-full py-2 bg-zinc-900 border border-zinc-800 hover:border-[#fab818] hover:text-[#fab818] text-zinc-300 font-mono text-xs uppercase tracking-wider transition font-bold"
                                        >
                                            VIEW BUILDER PROFILE →
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Broadcast Diagnostics Card */}
                            <div className="bg-[#111114] border border-zinc-800 p-5 space-y-3 font-mono text-xs shadow-xl">
                                <div className="border-b border-zinc-800 pb-3 text-zinc-400 uppercase font-bold tracking-wider text-[11px]">
                                    BROADCAST TELEMETRY
                                </div>

                                <div className="space-y-2 text-[11px]">
                                    <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                                        <span className="text-zinc-500">POST ID</span>
                                        <span className="text-zinc-300 font-mono">{postId?.slice(0, 12)}...</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                                        <span className="text-zinc-500">CREATED</span>
                                        <span className="text-zinc-300">{formatDate(post.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                                        <span className="text-zinc-500">REPLIES COUNT</span>
                                        <span className="text-[#fab818] font-bold">{comments.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                                        <span className="text-zinc-500">LIKES COUNT</span>
                                        <span className="text-rose-400 font-bold">{likesCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-zinc-500">MEDIA ATTACHED</span>
                                        <span className={post.image ? "text-emerald-400 font-bold" : "text-zinc-600"}>
                                            {post.image ? "YES // 1 IMAGE" : "NONE"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Navigation / Action */}
                            <div className="bg-gradient-to-b from-[#18181d] to-[#111114] border border-zinc-800 p-5 space-y-3 text-center">
                                <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                                    HAVE SOMETHING TO BROADCAST?
                                </p>
                                <p className="font-mono text-[11px] text-zinc-400 leading-relaxed">
                                    Share your projects, hackathon pitches, or campus milestones with the network.
                                </p>
                                <Link
                                    to="/create-post"
                                    className="block w-full py-2 bg-[#fab818] hover:bg-[#e0a515] text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition shadow-lg"
                                >
                                    + CREATE BROADCAST
                                </Link>
                            </div>

                        </aside>
                    </div>
                )}
            </main>

            {/* Delete Post Confirmation Modal */}
            {confirmDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#111114] border border-rose-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-rose-950/80 border border-rose-700 text-rose-400 font-mono font-bold text-base flex items-center justify-center">
                                !
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    CONFIRM BROADCAST DELETION
                                </h3>
                                <p className="text-xs font-mono text-zinc-400">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-zinc-300 font-mono leading-relaxed bg-zinc-950 p-3 border border-zinc-800">
                            You are about to permanently delete <strong className="text-white">"{post?.title}"</strong> from the BeyondCampus campus feed and database.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isDeletingPost}
                                onClick={() => setConfirmDeleteModal(false)}
                                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingPost}
                                onClick={handleDeletePost}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2"
                            >
                                {isDeletingPost ? (
                                    <>
                                        <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent animate-spin" />
                                        <span>DELETING...</span>
                                    </>
                                ) : (
                                    <span>CONFIRM DELETE</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* High-Resolution Image Lightbox Modal */}
            {isImageZoomed && post?.image && (
                <div
                    onClick={() => setIsImageZoomed(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
                >
                    <div className="relative max-w-5xl max-h-[90vh] overflow-hidden border border-zinc-800 bg-black">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="max-w-full max-h-[85vh] object-contain mx-auto"
                        />
                        <button
                            type="button"
                            onClick={() => setIsImageZoomed(false)}
                            className="absolute top-3 right-3 px-2.5 py-1 bg-black/80 border border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs uppercase"
                        >
                            CLOSE ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostDetails;