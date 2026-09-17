import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createPost } from "../services/postService";
import { useAuth } from "../context/AuthContext";
import mascotImg from "../assets/husky_mascot.png";

// Preset collegiate tracks (Clean SVG icons, no emojis)
const TRACKS = [
    {
        id: "showcase",
        label: "Project Showcase",
        tag: "#ProjectShowcase",
        placeholder: "e.g. Built an AI agent for SIH 2026 in 48 hours — architecture breakdown & demo...",
        hint: "Share screenshots, GitHub repo links, and engineering challenges you solved.",
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        )
    },
    {
        id: "hackathon",
        label: "Hackathon Sprint",
        tag: "#Hackathon",
        placeholder: "e.g. Looking for a Web3 / Smart Contract dev for ETHIndia collegiate track...",
        hint: "State the hackathon name, domain required, and team squad goals.",
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    },
    {
        id: "doubt",
        label: "Tech Doubt & Review",
        tag: "#TechDoubt",
        placeholder: "e.g. Getting MongoDB connection timeout in Docker container — here is my compose file...",
        hint: "Include error logs, code snippets, and what approaches you already tried.",
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        )
    },
    {
        id: "roadmap",
        label: "Placement & Roadmap",
        tag: "#Placement",
        placeholder: "e.g. My 6-month DSA & System Design preparation roadmap for Tier-1 off-campus drives...",
        hint: "Share structured study resources, LeetCode strategies, and mock interview tips.",
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
    {
        id: "general",
        label: "Campus Discussion",
        tag: "#CampusLife",
        placeholder: "e.g. How is your college club handling AI open-source contributions this semester?...",
        hint: "Start a conversation on campus tech culture, internships, or open-source events.",
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        )
    }
];

// Popular collegiate hashtag chips
const POPULAR_TAGS = [
    "#Hackathon",
    "#SIH2026",
    "#ProjectShowcase",
    "#TechDoubt",
    "#Placement",
    "#DSA",
    "#Web3",
    "#AI",
    "#React19",
    "#Devfolio",
    "#OpenSource"
];

// Simple markdown line renderer for Live Preview
function renderMarkdown(text) {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
        // Heading
        if (line.startsWith("### ")) {
            return (
                <h4 key={idx} className="text-sm font-bold text-white mt-3 mb-1 uppercase tracking-wide">
                    {line.replace("### ", "")}
                </h4>
            );
        }
        if (line.startsWith("## ")) {
            return (
                <h3 key={idx} className="text-base font-bold text-white mt-3 mb-1">
                    {line.replace("## ", "")}
                </h3>
            );
        }
        if (line.startsWith("# ")) {
            return (
                <h2 key={idx} className="text-lg font-black text-white mt-4 mb-2 tracking-tight">
                    {line.replace("# ", "")}
                </h2>
            );
        }

        // Blockquote
        if (line.startsWith("> ")) {
            return (
                <blockquote
                    key={idx}
                    className="pl-3 border-l-2 border-[#fab818] text-zinc-300 italic my-2 bg-white/[0.02] py-1.5"
                >
                    {line.replace("> ", "")}
                </blockquote>
            );
        }

        // Bullet list
        if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
                <li key={idx} className="ml-4 list-disc text-zinc-300 my-0.5 text-xs">
                    {parseInlineMarkdown(line.slice(2))}
                </li>
            );
        }

        // Empty line
        if (!line.trim()) {
            return <div key={idx} className="h-2" />;
        }

        // Standard paragraph
        return (
            <p key={idx} className="text-xs sm:text-sm text-zinc-300 leading-relaxed my-1">
                {parseInlineMarkdown(line)}
            </p>
        );
    });
}

// Parses inline bold, italic, code, and hashtags
function parseInlineMarkdown(str) {
    const parts = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|#[a-zA-Z0-9_]+)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIndex) {
            parts.push(str.substring(lastIndex, match.index));
        }
        const m = match[0];
        if (m.startsWith("`") && m.endsWith("`")) {
            parts.push(
                <code
                    key={match.index}
                    className="px-1.5 py-0.5 bg-zinc-850 text-[#fab818] font-mono text-[11px] border border-zinc-700"
                >
                    {m.slice(1, -1)}
                </code>
            );
        } else if (m.startsWith("**") && m.endsWith("**")) {
            parts.push(
                <strong key={match.index} className="text-white font-bold">
                    {m.slice(2, -2)}
                </strong>
            );
        } else if (m.startsWith("#")) {
            parts.push(
                <span key={match.index} className="text-[#fab818] font-medium font-mono text-xs mr-1">
                    {m}
                </span>
            );
        }
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
        parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : str;
}

function CreatePost() {
    const navigate = useNavigate();
    const textareaRef = useRef(null);
    const { currentUser } = useAuth();

    // Form inputs
    const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedTags, setSelectedTags] = useState(["#ProjectShowcase"]);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageInfo, setImageInfo] = useState({ name: "", size: "" });

    // UI state
    const [activeTab, setActiveTab] = useState("write"); // 'write' | 'preview'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Format file size
    const formatBytes = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Track selection handler
    const handleTrackSelect = (track) => {
        setSelectedTrack(track);
        if (!selectedTags.includes(track.tag)) {
            setSelectedTags([track.tag, ...selectedTags.filter((t) => !TRACKS.some((trk) => trk.tag === t))]);
        }
    };

    // Toggle hashtag chips
    const handleTagToggle = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((t) => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // Insert markdown helper
    const insertMarkdown = (prefix, suffix = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        const replacement = `${prefix}${selected || "text"}${suffix}`;
        const updated = text.substring(0, start) + replacement + text.substring(end);

        setContent(updated);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                start + replacement.length - suffix.length
            );
        }, 0);
    };

    // Image upload handler
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB.");
            return;
        }

        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        setImageInfo({
            name: file.name,
            size: formatBytes(file.size)
        });
        setError("");
    };

    // Remove attached image
    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        setImageInfo({ name: "", size: "" });
    };

    // Submit post
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Please provide a title for your post.");
            return;
        }

        if (!content.trim()) {
            setError("Post content cannot be empty.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            let finalTitle = title.trim();
            const missingTags = selectedTags.filter((t) => !finalTitle.includes(t));
            if (missingTags.length > 0) {
                finalTitle = `${finalTitle} ${missingTags.join(" ")}`;
            }

            formData.append("title", finalTitle);
            formData.append("content", content.trim());

            const response = await createPost(formData);
            const createdPost = response?.data?.data || response?.data || response;

            // Dispatch global event for half-screen Husky success takeover
            window.dispatchEvent(
                new CustomEvent("post-created", {
                    detail: {
                        ...createdPost,
                        title: finalTitle,
                        content: content.trim()
                    }
                })
            );
        } catch (err) {
            console.error("Failed to create post:", err);
            const status = err.response?.status;
            if (status === 401) {
                setError("Authentication required: Please log in to publish posts to the campus feed.");
            } else {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to create post. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#08080a] text-white flex flex-col font-sans antialiased selection:bg-[#fab818] selection:text-black">
            
            {/* Top Navigation Bar */}
            <Navbar />

            {/* Main Workspace Area */}
            <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex-1">
                
                {/* Architectural Breadcrumb & Page Header */}
                <div className="mb-8 border-b border-zinc-850 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-zinc-500">
                            <Link to="/" className="hover:text-[#fab818] transition flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#fab818]" />
                                <span>Feed</span>
                            </Link>
                            <span>/</span>
                            <span className="text-zinc-300">Compose</span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                            New Post
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-400 font-normal">
                            Publish engineering milestones, doubts, and hackathon recruitments to the network.
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="px-4 py-2 border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white transition self-start sm:self-auto"
                    >
                        Discard
                    </Link>
                </div>

                {/* Main 12-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* =========================================================
                        LEFT COLUMN: SHARP RECTANGULAR COMPOSER FORM (8 Cols)
                    ========================================================== */}
                    <div className="lg:col-span-8 space-y-6">
                        

                        {/* Error Banner with Direct Login Prompt */}
                        {error && (
                            <div className="p-4 border-l-4 border-rose-500 bg-zinc-900 border border-zinc-800 text-rose-300 text-xs sm:text-sm font-semibold flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p>{error}</p>
                                    {error.includes("log in") && (
                                        <Link
                                            to="/login"
                                            className="inline-block mt-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider"
                                        >
                                            Sign In Now &rarr;
                                        </Link>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setError("")}
                                    className="text-rose-400 hover:text-white text-sm font-bold cursor-pointer"
                                >
                                    &times;
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Primary Rectangular Composer Panel */}
                            <div className="border border-zinc-800 bg-[#111114] shadow-2xl p-6 sm:p-7 space-y-6">
                                
                                {/* 1. Track Selector - Sharp Rectangular Grid */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                                        <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">
                                            Discussion Track
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-600">
                                            REQUIRED
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                        {TRACKS.map((track) => {
                                            const isSelected = selectedTrack.id === track.id;
                                            return (
                                                <button
                                                    key={track.id}
                                                    type="button"
                                                    onClick={() => handleTrackSelect(track)}
                                                    className={`p-3 border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                                                        isSelected
                                                            ? "border-[#fab818] bg-[#fab818]/10 text-white"
                                                            : "border-zinc-800 bg-[#0a0a0d] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={isSelected ? "text-[#fab818]" : "text-zinc-500"}>
                                                            {track.icon}
                                                        </span>
                                                        <span className={`w-1.5 h-1.5 ${isSelected ? "bg-[#fab818]" : "bg-transparent border border-zinc-700"}`} />
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-tight leading-snug">
                                                        {track.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[11px] font-mono text-zinc-500">
                                        {selectedTrack.hint}
                                    </p>
                                </div>

                                {/* 2. Post Title Input - Sharp Box */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="post-title" className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">
                                            Headline
                                        </label>
                                        <span className={`text-[10px] font-mono ${title.length > 100 ? "text-amber-400" : "text-zinc-600"}`}>
                                            {title.length} / 120
                                        </span>
                                    </div>
                                    <input
                                        id="post-title"
                                        type="text"
                                        maxLength={120}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={selectedTrack.placeholder}
                                        className="w-full h-12 px-4 border border-zinc-800 bg-[#09090b] focus:border-[#fab818] text-sm font-semibold text-white placeholder:text-zinc-700 focus:outline-none transition"
                                    />
                                </div>

                                {/* 3. Hashtags Cloud - Rectangular Chips */}
                                <div className="space-y-2.5">
                                    <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase block">
                                        Index Tags
                                    </span>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {POPULAR_TAGS.map((tag) => {
                                            const isSelected = selectedTags.includes(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => handleTagToggle(tag)}
                                                    className={`px-3 py-1.5 text-xs font-mono border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "border-[#fab818] text-[#fab818] bg-[#fab818]/10 font-bold"
                                                            : "border-zinc-800 bg-[#0a0a0d] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                                                    }`}
                                                >
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 4. Content Area & Markdown Toolstrip */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                                        <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">
                                            Body &amp; Specification
                                        </span>

                                        {/* Sharp Segmented Mode Switcher */}
                                        <div className="flex border border-zinc-800 bg-[#09090b]">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("write")}
                                                className={`px-3 py-1 text-xs font-mono font-semibold transition cursor-pointer ${
                                                    activeTab === "write"
                                                        ? "bg-zinc-800 text-white"
                                                        : "text-zinc-500 hover:text-zinc-300"
                                                }`}
                                            >
                                                EDIT
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("preview")}
                                                className={`px-3 py-1 text-xs font-mono font-semibold transition cursor-pointer ${
                                                    activeTab === "preview"
                                                        ? "bg-[#fab818] text-slate-950 font-bold"
                                                        : "text-zinc-500 hover:text-zinc-300"
                                                }`}
                                            >
                                                PREVIEW
                                            </button>
                                        </div>
                                    </div>

                                    {/* Markdown Action Strip (Write Mode) */}
                                    {activeTab === "write" && (
                                        <div className="flex flex-wrap items-center gap-1 p-2 border border-zinc-800 bg-[#09090b] text-xs">
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdown("**", "**")}
                                                title="Bold"
                                                className="px-2.5 py-1 border border-transparent hover:border-zinc-700 hover:bg-zinc-850 text-zinc-300 hover:text-white font-bold cursor-pointer font-mono"
                                            >
                                                B
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdown("*", "*")}
                                                title="Italic"
                                                className="px-2.5 py-1 border border-transparent hover:border-zinc-700 hover:bg-zinc-850 text-zinc-300 hover:text-white italic cursor-pointer font-serif"
                                            >
                                                I
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdown("### ")}
                                                title="Heading"
                                                className="px-2.5 py-1 border border-transparent hover:border-zinc-700 hover:bg-zinc-850 text-zinc-300 hover:text-white font-bold cursor-pointer font-mono text-[11px]"
                                            >
                                                H3
                                            </button>
                                            <span className="text-zinc-800">|</span>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdown("`", "`")}
                                                title="Inline Code"
                                                className="px-2 py-1 border border-transparent hover:border-zinc-700 hover:bg-zinc-850 text-zinc-300 hover:text-white font-mono text-[11px] cursor-pointer"
                                            >
                                                &lt;code&gt;
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdown("```\n", "\n```")}
                                                title="Code Block"
                                                className="px-2 py-1 border border-transparent hover:border-zinc-700 hover:bg-zinc-850 text-zinc-300 hover:text-white font-mono text-[11px] cursor-pointer"
                                            >
                                                [block]
                                            </button>
                                            <span className="text-zinc-800">|</span>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdown("- ")}
                                                title="Bullet List"
                                                className="px-2.5 py-1 border border-transparent hover:border-zinc-700 hover:bg-zinc-850 text-zinc-300 hover:text-white cursor-pointer font-mono text-[11px]"
                                            >
                                                List
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdown("> ")}
                                                title="Quote"
                                                className="px-2.5 py-1 border border-transparent hover:border-zinc-700 hover:bg-zinc-850 text-zinc-300 hover:text-white cursor-pointer font-mono text-[11px]"
                                            >
                                                Quote
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertMarkdown("[Link Title](", ")")}
                                                title="Hyperlink"
                                                className="px-2.5 py-1 border border-transparent hover:border-zinc-700 hover:bg-zinc-850 text-zinc-300 hover:text-white cursor-pointer font-mono text-[11px]"
                                            >
                                                Link
                                            </button>
                                        </div>
                                    )}

                                    {/* Textarea - Sharp Rectangular Surface */}
                                    {activeTab === "write" ? (
                                        <textarea
                                            ref={textareaRef}
                                            rows={10}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Document your architecture, code snippets, engineering problem statement, or hackathon requirements..."
                                            className="w-full p-4 border border-zinc-800 bg-[#09090b] focus:border-[#fab818] text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none font-mono leading-relaxed transition resize-y"
                                        />
                                    ) : (
                                        /* Live Formatted Markdown Preview */
                                        <div className="min-h-[240px] p-5 border border-zinc-800 bg-[#09090b] overflow-y-auto">
                                            {content.trim() ? (
                                                <div className="space-y-1">
                                                    {renderMarkdown(content)}
                                                </div>
                                            ) : (
                                                <p className="text-zinc-600 font-mono text-xs">
                                                    // No content drafted yet.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                                        <span>MARKDOWN FORMATTING ENABLED</span>
                                        <span>
                                            {content.trim() ? content.trim().split(/\s+/).length : 0} WORDS &bull; {content.length} CHARS
                                        </span>
                                    </div>
                                </div>

                                {/* 5. Media Upload Dropzone - Sharp Rectangular Frame */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase block">
                                        Telemetry &amp; Diagram Attachment <span className="text-zinc-600 font-normal lowercase">(optional)</span>
                                    </span>

                                    {!imagePreview ? (
                                        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 hover:border-[#fab818]/60 bg-[#09090b] cursor-pointer transition group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <div className="w-10 h-10 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-[#fab818] transition">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-300 mt-3 group-hover:text-white">
                                                Upload Architecture Graphic or Screenshot
                                            </p>
                                            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                                                PNG, JPG, WEBP, GIF UP TO 5MB
                                            </p>
                                        </label>
                                    ) : (
                                        /* Sharp Image Preview Card */
                                        <div className="border border-zinc-800 bg-[#09090b] p-3 space-y-3">
                                            <div className="max-h-72 bg-black border border-zinc-850 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={imagePreview}
                                                    alt="Upload preview"
                                                    className="w-full h-auto max-h-72 object-contain"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-xs px-1">
                                                <div className="font-mono text-[11px] truncate text-zinc-300">
                                                    <span>{imageInfo.name}</span>{" "}
                                                    <span className="text-zinc-600">[{imageInfo.size}]</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="px-2.5 py-1 border border-rose-500/40 hover:bg-rose-500/20 text-rose-400 font-mono text-[10px] uppercase tracking-wider transition cursor-pointer"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 6. Submission Action Bar */}
                                <div className="pt-6 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                        <span className="w-2 h-2 bg-[#fab818]" />
                                        <span>BEYONDCAMPUS REPOSITORY PROTOCOL</span>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Link
                                            to="/"
                                            className="flex-1 sm:flex-none text-center px-5 py-3 border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition"
                                        >
                                            Discard
                                        </Link>

                                        <button
                                            type="submit"
                                            disabled={loading || !title.trim() || !content.trim()}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#fab818] hover:bg-[#ffc53d] text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(250,184,24,0.3)] hover:shadow-[0_0_30px_rgba(250,184,24,0.5)] transition transform active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    <span>Broadcasting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Publish Post</span>
                                                    <span>&rarr;</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </form>
                    </div>

                    {/* =========================================================
                        RIGHT COLUMN: LIVE FEED CARD PREVIEW & REFINED PROTOCOLS (4 Cols)
                    ========================================================== */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        
                        {/* Live Feed Card Preview - Sharp Architectural Frame */}
                        <div className="border border-zinc-800 bg-[#111114] p-5 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                                <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-[#fab818]" />
                                    <span>Real-Time Output Preview</span>
                                </span>
                                <span className="text-[9px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">
                                    LIVE
                                </span>
                            </div>

                            {/* Simulated Feed Card - Crisp Rectangular Box */}
                            <div className="p-4 border border-zinc-800 bg-[#09090b] space-y-3">
                                {/* Author Info */}
                                <div className="flex items-center gap-3">
                                    {currentUser?.avatar ? (
                                        <img
                                            src={currentUser.avatar}
                                            alt={currentUser.fullname || "User"}
                                            className="w-8 h-8 object-cover border border-zinc-700"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-zinc-850 text-[#fab818] font-mono font-bold text-xs flex items-center justify-center border border-zinc-700">
                                            {currentUser?.fullname ? currentUser.fullname[0].toUpperCase() : "BC"}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-white truncate">
                                                {currentUser?.fullname || "You (Collegiate Builder)"}
                                            </p>
                                            <span className="text-[9px] font-mono uppercase bg-zinc-850 border border-zinc-700 text-zinc-400 px-1.5 py-0.2">
                                                BUILDER
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-mono text-zinc-500">
                                            Just now &bull; {selectedTrack.label}
                                        </p>
                                    </div>
                                </div>

                                {/* Title Preview */}
                                <h3 className="text-sm font-bold text-white leading-snug">
                                    {title.trim() || (
                                        <span className="text-zinc-650 italic">
                                            {selectedTrack.placeholder}
                                        </span>
                                    )}
                                </h3>

                                {/* Tags Preview */}
                                {selectedTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {selectedTags.map((t, idx) => (
                                            <span
                                                key={idx}
                                                className="text-[10px] font-mono text-[#fab818] bg-[#fab818]/10 border border-[#fab818]/30 px-1.5 py-0.5"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Content Preview Snippet */}
                                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed font-mono">
                                    {content.trim() || (
                                        <span className="text-zinc-650 italic">
                                            Draft your post content on the left to preview it here...
                                        </span>
                                    )}
                                </p>

                                {/* Image Preview in simulated card */}
                                {imagePreview && (
                                    <div className="border border-zinc-800 max-h-36 bg-black overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-auto max-h-36 object-cover"
                                        />
                                    </div>
                                )}

                                {/* Card Footer Mock */}
                                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-zinc-500 font-mono text-[10px]">
                                    <span className="flex items-center gap-1.5">
                                        <span>0 LIKES</span> &bull; <span>0 COMMENTS</span>
                                    </span>
                                    <span className="text-zinc-400">CONNECT</span>
                                </div>
                            </div>
                        </div>

                        {/* Husky Mascot Protocols Card - Crisp Architectural Box */}
                        <div className="border border-zinc-800 bg-[#111114] p-5 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3 border-b border-zinc-850 pb-3">
                                <div className="w-10 h-10 border border-zinc-800 bg-zinc-900 p-1 flex items-center justify-center shrink-0">
                                    <img
                                        src={mascotImg}
                                        alt="Husky Mascot"
                                        className="w-full h-full object-contain filter drop-shadow"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                                        Posting Protocols
                                    </h4>
                                    <p className="text-[10px] font-mono text-zinc-500">
                                        OPTIMIZING PEER REACH
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs text-zinc-400">
                                <div className="border-l-2 border-[#fab818] pl-3 py-1 space-y-0.5">
                                    <p className="text-white font-bold text-[11px] uppercase tracking-wide">
                                        01. Specification
                                    </p>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                                        Clear architectural titles attract senior student mentors 3x faster.
                                    </p>
                                </div>

                                <div className="border-l-2 border-zinc-700 pl-3 py-1 space-y-0.5">
                                    <p className="text-white font-bold text-[11px] uppercase tracking-wide">
                                        02. Visual Telemetry
                                    </p>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                                        Attach UI screenshots or system diagrams for showcase approval.
                                    </p>
                                </div>

                                <div className="border-l-2 border-zinc-700 pl-3 py-1 space-y-0.5">
                                    <p className="text-white font-bold text-[11px] uppercase tracking-wide">
                                        03. Domain Routing
                                    </p>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                                        Use #SIH2026 or #Web3 to match with collegiate teammates across campuses.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default CreatePost;