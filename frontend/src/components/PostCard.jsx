import { useState } from "react";
import { Link } from "react-router-dom";
import { deletePost } from "../services/postService";
import { getCommentsByPostId, addComment } from "../services/commentService";

function PostCard({ post, onPostDeleted }) {
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedToast, setCopiedToast] = useState(false);

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

    const handleLike = () => {
        if (isLiked) {
            setLikesCount((prev) => Math.max(0, prev - 1));
            setIsLiked(false);
        } else {
            setLikesCount((prev) => prev + 1);
            setIsLiked(true);
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

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

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
                        {author.avatar ? (
                            <img
                                src={author.avatar}
                                alt={authorName}
                                className="w-10 h-10 rounded-full object-cover border border-white/[0.1]"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 text-[#fab818] font-mono font-bold text-xs flex items-center justify-center border border-white/[0.1]">
                                {authorInitials}
                            </div>
                        )}

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                    {authorName}
                                </span>
                                <span className="text-[11px] font-mono text-zinc-400">
                                    @{authorUsername}
                                </span>
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
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition cursor-pointer"
                                    >
                                        Copy Link
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={handleDelete}
                                        className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                    >
                                        {isDeleting ? "Deleting..." : "Delete Post"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Post Title & Content */}
                <div className="space-y-2">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                        {post.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                        {post.content}
                    </p>
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
                        <button
                            type="button"
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                isLiked
                                    ? "text-rose-400 bg-rose-500/10 border border-rose-500/30"
                                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                            }`}
                        >
                            <svg
                                className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-zinc-400"}`}
                                fill={isLiked ? "currentColor" : "none"}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{likesCount}</span>
                        </button>

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
                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                                        <div className="w-7 h-7 rounded-full bg-zinc-800 text-[#fab818] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-white/[0.08]">
                                            {comment.createdBy?.fullname?.[0] || comment.createdBy?.username?.[0] || "U"}
                                        </div>
                                        <div className="flex-1 space-y-0.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-white">
                                                    {comment.createdBy?.fullname || comment.createdBy?.username || "Student"}
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-500">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-zinc-300 leading-relaxed font-normal">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </article>
    );
}

export default PostCard;
