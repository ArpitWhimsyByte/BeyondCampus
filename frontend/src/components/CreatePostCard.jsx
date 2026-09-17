import { useState } from "react";
import { createPost } from "../services/postService";

const TAGS = ["#Hackathon", "#ProjectShowcase", "#TechDoubt", "#Placement"];

function CreatePostCard({ onPostCreated }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be under 5MB");
            return;
        }

        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        setError("");
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleTagClick = (tag) => {
        setIsExpanded(true);
        if (!title) {
            setTitle(`${tag} `);
        } else if (!title.includes(tag)) {
            setTitle((prev) => `${prev} ${tag}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !content.trim()) {
            setError("Both title and content are required.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("content", content.trim());
            if (image) {
                formData.append("image", image);
            }

            const response = await createPost(formData);
            const createdPost = response.data || response;

            if (onPostCreated && createdPost) {
                onPostCreated(createdPost);
            }

            // Dispatch global event for half-screen Husky success takeover
            window.dispatchEvent(
                new CustomEvent("post-created", {
                    detail: {
                        ...createdPost,
                        title: title.trim(),
                        content: content.trim()
                    }
                })
            );

            setTitle("");
            setContent("");
            setImage(null);
            setImagePreview(null);
            setIsExpanded(false);
        } catch (err) {
            console.error("Create post error:", err);
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Failed to create post. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            id="create-post-section"
            className="bg-gradient-to-b from-[#18181d] to-[#121216] border border-white/[0.08] rounded-2xl p-5 shadow-xl relative"
        >
            {/* Top Section Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                <span className="text-xs font-sans font-bold tracking-wider text-zinc-300 uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fab818]" />
                    <span>Create Post</span>
                </span>
                <span className="text-[11px] font-sans font-medium text-zinc-500">
                    Share with campus
                </span>
            </div>

            {error && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-sans font-medium flex items-center justify-between">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")} className="text-rose-300 font-bold cursor-pointer">&times;</button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-white/[0.1] text-[#fab818] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        YOU
                    </div>

                    <div className="flex-1 space-y-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            placeholder="Start an engineering discussion, share an MVP, or ask a doubt..."
                            className="w-full h-11 px-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.08] focus:border-[#fab818]/80 text-xs sm:text-sm font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#fab818]/10 transition"
                        />

                        {isExpanded && (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Provide more details, links, or architectural questions..."
                                rows={3}
                                className="w-full p-3.5 rounded-xl bg-zinc-950/60 border border-white/[0.08] focus:border-[#fab818]/80 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#fab818]/10 resize-none transition"
                            />
                        )}

                        {imagePreview && (
                            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/[0.1] w-max max-w-full">
                                <img
                                    src={imagePreview}
                                    alt="Upload preview"
                                    className="max-h-48 rounded-xl object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/80 text-white font-bold text-xs flex items-center justify-center hover:bg-rose-600 transition cursor-pointer"
                                >
                                    &times;
                                </button>
                            </div>
                        )}

                        {/* Bottom Actions Bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-mono cursor-pointer border border-white/[0.08] transition">
                                    <svg className="w-4 h-4 text-[#fab818]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>

                                {TAGS.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => handleTagClick(t)}
                                        className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-white text-[11px] font-mono border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !title.trim() || !content.trim()}
                                className="px-5 h-9 rounded-xl bg-gradient-to-r from-[#fab818] to-[#f59e0b] hover:from-[#ffc43a] hover:to-[#fbbf24] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(250,184,24,0.2)] transition transform active:scale-95 cursor-pointer"
                            >
                                {loading ? "Publishing..." : "Publish Post"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CreatePostCard;
