import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { getMyPosts } from "../services/postService";
import { getCurrentUser, logoutUser, updateCoverImage, updateAvatar } from "../services/authService";
import mascotImg from "../assets/husky_mascot.png";

function Profile() {
    const navigate = useNavigate();

    // User state: initialize from localStorage first, then refresh from API
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem("beyondcampus_user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'badges' | 'protocols'
    const [error, setError] = useState("");

    // Uploading states & status toast
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [statusToast, setStatusToast] = useState("");

    // Fetch fresh user profile & their authored posts
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                // Fetch fresh user data from server if session active
                try {
                    const userRes = await getCurrentUser();
                    if (userRes?.data) {
                        setUser(userRes.data);
                        localStorage.setItem("beyondcampus_user", JSON.stringify(userRes.data));
                    }
                } catch (err) {
                    console.warn("Could not refresh user session from server, using local data:", err);
                }

                // Fetch current user's authored posts
                setLoadingPosts(true);
                const postsRes = await getMyPosts();
                if (postsRes?.data && Array.isArray(postsRes.data)) {
                    setPosts(postsRes.data);
                } else if (Array.isArray(postsRes)) {
                    setPosts(postsRes);
                } else {
                    setPosts([]);
                }
            } catch (err) {
                console.error("Error loading profile posts:", err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load user broadcasts. Please sign in again."
                );
            } finally {
                setLoadingPosts(false);
            }
        };

        loadProfileData();
    }, []);

    // Cover image upload handler
    const handleCoverChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 8 * 1024 * 1024) {
            setStatusToast("Cover image size must be under 8MB");
            setTimeout(() => setStatusToast(""), 3500);
            return;
        }

        try {
            setUploadingCover(true);
            setStatusToast("Uploading cover image to campus servers...");

            const formData = new FormData();
            formData.append("coverImage", file);

            const res = await updateCoverImage(formData);
            const updatedUser = res.data;

            if (updatedUser) {
                setUser(updatedUser);
                localStorage.setItem("beyondcampus_user", JSON.stringify(updatedUser));
                setStatusToast("Cover image updated successfully!");
            }
        } catch (err) {
            console.error("Failed to update cover image:", err);
            setStatusToast(
                err.response?.data?.message ||
                err.message ||
                "Failed to update cover image. Please try again."
            );
        } finally {
            setUploadingCover(false);
            setTimeout(() => setStatusToast(""), 4000);
        }
    };

    // Avatar upload handler
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setStatusToast("Avatar image size must be under 5MB");
            setTimeout(() => setStatusToast(""), 3500);
            return;
        }

        try {
            setUploadingAvatar(true);
            setStatusToast("Uploading profile avatar...");

            const formData = new FormData();
            formData.append("avatar", file);

            const res = await updateAvatar(formData);
            const updatedUser = res.data;

            if (updatedUser) {
                setUser(updatedUser);
                localStorage.setItem("beyondcampus_user", JSON.stringify(updatedUser));
                setStatusToast("Avatar updated successfully!");
            }
        } catch (err) {
            console.error("Failed to update avatar:", err);
            setStatusToast(
                err.response?.data?.message ||
                err.message ||
                "Failed to update avatar. Please try again."
            );
        } finally {
            setUploadingAvatar(false);
            setTimeout(() => setStatusToast(""), 4000);
        }
    };

    // Post deleted callback
    const handlePostDeleted = (deletedId) => {
        setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    };

    // Logout handler
    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("beyondcampus_user");
            navigate("/login");
        }
    };

    // Formatted member join date
    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric"
          })
        : "Sep 2026";

    // Estimated Aura & Reach telemetry
    const postCount = posts.length;
    const auraCount = 500 + postCount * 50;
    const estimatedReach = (postCount * 1.4 + 2.5).toFixed(1);

    return (
        <div className="min-h-screen w-full bg-[#08080a] text-white flex flex-col font-sans antialiased selection:bg-[#fab818] selection:text-black">
            
            {/* Top Fixed Island Navbar */}
            <Navbar />

            {/* Main Profile Workspace Container */}
            <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex-1 space-y-8">
                
                {/* Architectural Breadcrumbs */}
                <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    <Link to="/" className="hover:text-[#fab818] transition flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#fab818]" />
                        <span>Feed</span>
                    </Link>
                    <span className="text-zinc-600">/</span>
                    <span className="text-zinc-200 font-bold">Builder Profile</span>
                </div>

                {/* Status / Error Toast Notification */}
                {(statusToast || error) && (
                    <div className={`p-3.5 border-l-4 border border-zinc-800 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between shadow-xl ${
                        error ? "border-l-rose-500 bg-rose-950/20 text-rose-300" : "border-l-[#fab818] bg-zinc-900 text-white"
                    }`}>
                        <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 ${error ? "bg-rose-500" : "bg-[#fab818] animate-ping"}`} />
                            <span>{statusToast || error}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setStatusToast("");
                                setError("");
                            }}
                            className="text-zinc-400 hover:text-white font-bold text-sm cursor-pointer ml-4"
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* Primary Profile Identity Header Box */}
                <div className="border border-zinc-800 bg-[#111114] shadow-2xl relative overflow-hidden">
                    
                    {/* Golden top accent highlight line */}
                    <div className="h-1 bg-gradient-to-r from-[#fab818] via-amber-400 to-[#fab818]" />

                    {/* Cover Banner Area */}
                    <div className="h-44 sm:h-60 w-full relative overflow-hidden bg-gradient-to-r from-[#141419] via-[#111115] to-[#0a0a0d] border-b border-zinc-850">
                        
                        {/* Cover Image Upload Button */}
                        <label className="absolute top-4 right-4 z-20 px-3.5 py-1.5 bg-black/85 hover:bg-black border border-zinc-700 hover:border-[#fab818] text-xs font-mono font-bold uppercase tracking-wider text-zinc-200 hover:text-white transition cursor-pointer flex items-center gap-2 shadow-2xl backdrop-blur-md">
                            {uploadingCover ? (
                                <div className="w-3.5 h-3.5 border-2 border-[#fab818] border-t-transparent animate-spin" />
                            ) : (
                                <svg className="w-4 h-4 text-[#fab818]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                            <span>{uploadingCover ? "Uploading..." : user?.coverImage ? "Change Cover" : "Upload Cover"}</span>
                            <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingCover}
                                onChange={handleCoverChange}
                                className="hidden"
                            />
                        </label>

                        {/* Banner Image or High-Tech Cyber Grid */}
                        {user?.coverImage ? (
                            <>
                                <img
                                    src={user.coverImage}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-black/30 to-transparent" />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-between px-8 py-6 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(#fab818_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
                                <div className="relative z-10 space-y-1">
                                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#fab818] font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-[#fab818]" />
                                        <span>Collegiate Builder Network // 2026</span>
                                    </span>
                                    <p className="text-xs text-zinc-400 font-mono">
                                        Verified Tier-1 Engineering Campus Profile
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Identity Details & Actions Bar */}
                    <div className="px-6 pb-6 pt-2">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            
                            {/* Avatar & Personal Data */}
                            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                                
                                {/* Sharp Square Avatar Frame with Hover Edit Overlay */}
                                <div className="group relative -mt-16 sm:-mt-20 w-28 h-28 sm:w-32 sm:h-32 bg-[#0c0c0e] border-2 border-[#fab818] shadow-2xl shrink-0 overflow-hidden flex items-center justify-center">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.fullname || "Builder"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-black text-[#fab818] font-mono">
                                            {(user?.fullname || user?.username || "BC").substring(0, 2).toUpperCase()}
                                        </span>
                                    )}

                                    {/* Hover Overlay to Edit Avatar */}
                                    <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-mono font-bold text-white cursor-pointer transition-opacity backdrop-blur-xs">
                                        {uploadingAvatar ? (
                                            <div className="w-4 h-4 border-2 border-[#fab818] border-t-transparent animate-spin" />
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 text-[#fab818]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                </svg>
                                                <span className="mt-1 uppercase tracking-wider">Change</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            disabled={uploadingAvatar}
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>

                                    {/* Online indicator dot */}
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-black z-10" />
                                </div>

                                {/* Names & Metadata */}
                                <div className="space-y-1.5">
                                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#fab818]/10 border border-[#fab818]/30 text-[#fab818] text-[10px] font-mono font-bold uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 bg-[#fab818] animate-pulse" />
                                        <span>Verified Collegiate Engineer</span>
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                                        {user?.fullname || "Collegiate Builder"}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                                        <span className="text-[#fab818] font-bold">
                                            @{user?.username || "student_dev"}
                                        </span>
                                        <span className="text-zinc-600">&bull;</span>
                                        <span className="text-zinc-400">
                                            {user?.email || "student@campus.edu"}
                                        </span>
                                        <span className="text-zinc-600">&bull;</span>
                                        <span className="text-zinc-400">
                                            Joined {memberSince}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 self-start md:self-auto">
                                <Link
                                    to="/create-post"
                                    className="px-5 py-2.5 bg-[#fab818] hover:bg-[#ffdb24] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center gap-2"
                                >
                                    <span>+ New Broadcast</span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="px-4 py-2.5 border border-zinc-800 bg-zinc-900 hover:bg-rose-950/40 hover:border-rose-800/80 text-zinc-400 hover:text-rose-400 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                                >
                                    Sign Out
                                </button>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Builder Telemetry Grid: 4 Sharp Rectangular Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="border border-zinc-800 bg-[#111114] p-5 space-y-1 shadow-lg">
                        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
                            Broadcasts Published
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                            {postCount}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                            Active campus contributions
                        </p>
                    </div>

                    <div className="border border-zinc-800 bg-[#111114] p-5 space-y-1 shadow-lg">
                        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
                            Collegiate Aura
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-[#fab818] font-mono">
                            +{auraCount}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                            Based on peer interactions
                        </p>
                    </div>

                    <div className="border border-zinc-800 bg-[#111114] p-5 space-y-1 shadow-lg">
                        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
                            Network Reach
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                            {estimatedReach}K
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                            Estimated peer views
                        </p>
                    </div>

                    <div className="border border-zinc-800 bg-[#111114] p-5 space-y-1 shadow-lg">
                        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
                            Builder Status
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-emerald-400 animate-pulse" />
                            <span>ONLINE</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                            Ready for hackathon squads
                        </p>
                    </div>

                </div>

                {/* Primary Content Grid: Left Main Tabs (8 Cols), Right Telemetry (4 Cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* =========================================================
                        LEFT COLUMN: TABBED BROADCAST STREAM (8 Cols)
                    ========================================================== */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Rectangular Tab Bar */}
                        <div className="border border-zinc-800 bg-[#111114] p-1 flex items-center gap-1 shadow-md">
                            <button
                                type="button"
                                onClick={() => setActiveTab("posts")}
                                className={`px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    activeTab === "posts"
                                        ? "bg-[#fab818] text-slate-950 shadow-sm"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                }`}
                            >
                                My Broadcasts ({postCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("badges")}
                                className={`px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    activeTab === "badges"
                                        ? "bg-[#fab818] text-slate-950 shadow-sm"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                }`}
                            >
                                Accolades &amp; Squads
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("protocols")}
                                className={`px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    activeTab === "protocols"
                                        ? "bg-[#fab818] text-slate-950 shadow-sm"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                }`}
                            >
                                Account Protocols
                            </button>
                        </div>

                        {/* TAB 1: MY BROADCASTS */}
                        {activeTab === "posts" && (
                            <div className="space-y-4">
                                {loadingPosts ? (
                                    <div className="border border-zinc-800 bg-[#111114] p-12 text-center space-y-3">
                                        <div className="w-8 h-8 border-2 border-[#fab818] border-t-transparent animate-spin mx-auto" />
                                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                                            Retrieving your campus milestones...
                                        </p>
                                    </div>
                                ) : posts.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {posts.map((post) => (
                                            <PostCard
                                                key={post._id}
                                                post={post}
                                                onPostDeleted={handlePostDeleted}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    /* Empty Posts State */
                                    <div className="border border-zinc-800 bg-[#111114] p-10 sm:p-12 text-center space-y-5">
                                        <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 p-2 mx-auto flex items-center justify-center">
                                            <img
                                                src={mascotImg}
                                                alt="Husky Mascot"
                                                className="w-full h-full object-contain filter drop-shadow"
                                            />
                                        </div>

                                        <div className="space-y-1.5 max-w-md mx-auto">
                                            <h3 className="text-base font-bold text-white uppercase tracking-tight">
                                                No Broadcasts Published Yet
                                            </h3>
                                            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                                Share your hackathon project architecture, placement roadmap, or engineering doubts with 5,000+ peers.
                                            </p>
                                        </div>

                                        <div>
                                            <Link
                                                to="/create-post"
                                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#fab818] hover:bg-[#ffdb24] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition"
                                            >
                                                <span>Publish Your First Milestone &rarr;</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: ACCOLADES & SQUADS */}
                        {activeTab === "badges" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    
                                    <div className="border border-zinc-800 bg-[#111114] p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-[#fab818] bg-[#fab818]/10 border border-[#fab818]/30 px-2 py-0.5 uppercase">
                                                SIH 2026
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-500">
                                                VERIFIED SQUAD
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white uppercase">
                                            Smart India Hackathon Lead
                                        </h4>
                                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                                            Registered squad builder targeting Smart Automation &amp; Agentic Systems track.
                                        </p>
                                    </div>

                                    <div className="border border-zinc-800 bg-[#111114] p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 uppercase">
                                                DSA MASTER
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-500">
                                                PLACEMENT
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white uppercase">
                                            Algorithm Mentor
                                        </h4>
                                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                                            Verified reviewer for Dynamic Programming and System Design peer mock rounds.
                                        </p>
                                    </div>

                                    <div className="border border-zinc-800 bg-[#111114] p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 uppercase">
                                                OPEN SOURCE
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-500">
                                                GITHUB CAMPUS
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white uppercase">
                                            Collegiate Contributor
                                        </h4>
                                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                                            Active maintainer of collegiate software repositories and developer tools.
                                        </p>
                                    </div>

                                    <div className="border border-zinc-800 bg-[#111114] p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 uppercase">
                                                DEV SQUAD
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-500">
                                                ETHINDIA 2026
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white uppercase">
                                            Web3 Architect
                                        </h4>
                                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                                            Smart contracts, decentralized infrastructure, and zk-proof implementation squad.
                                        </p>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* TAB 3: ACCOUNT PROTOCOLS */}
                        {activeTab === "protocols" && (
                            <div className="border border-zinc-800 bg-[#111114] p-6 space-y-5">
                                <div className="border-b border-zinc-850 pb-3">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Account Credentials &amp; Session Telemetry
                                    </h3>
                                    <p className="text-xs text-zinc-500 font-mono">
                                        SYSTEM INFORMATION FOR THE ACTIVE BUILDER SESSION
                                    </p>
                                </div>

                                <div className="space-y-3 font-mono text-xs">
                                    <div className="flex justify-between border-b border-zinc-850/60 pb-2">
                                        <span className="text-zinc-500">User Identification ID:</span>
                                        <span className="text-zinc-300 select-all">{user?._id || "Unavailable"}</span>
                                    </div>

                                    <div className="flex justify-between border-b border-zinc-850/60 pb-2">
                                        <span className="text-zinc-500">Email Address:</span>
                                        <span className="text-zinc-300">{user?.email || "student@campus.edu"}</span>
                                    </div>

                                    <div className="flex justify-between border-b border-zinc-850/60 pb-2">
                                        <span className="text-zinc-500">Unique Handle:</span>
                                        <span className="text-[#fab818]">@{user?.username || "student"}</span>
                                    </div>

                                    <div className="flex justify-between border-b border-zinc-850/60 pb-2">
                                        <span className="text-zinc-500">Authentication Mechanism:</span>
                                        <span className="text-emerald-400">JWT HTTP-Only Secured</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Platform Access Tier:</span>
                                        <span className="text-white font-bold">Collegiate Tier-1 Engineer</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* =========================================================
                        RIGHT COLUMN: PROTOCOLS & HUSKY COMPANION (4 Cols)
                    ========================================================== */}
                    <aside className="lg:col-span-4 space-y-6">
                        
                        {/* Husky Mascot Builder Card */}
                        <div className="border border-zinc-800 bg-[#111114] p-5 space-y-4 shadow-xl">
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
                                        Campus Wingman
                                    </h4>
                                    <p className="text-[10px] font-mono text-zinc-500">
                                        BUILDER LEVEL 04
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                                Keep publishing milestones to unlock verified campus lead badges and collegiate recruitment endorsements.
                            </p>

                            <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px] font-mono">
                                <span className="text-zinc-500">NEXT MILESTONE:</span>
                                <span className="text-[#fab818] font-bold">1,000 AURA</span>
                            </div>
                        </div>

                        {/* Engineering Protocols Card */}
                        <div className="border border-zinc-800 bg-[#111114] p-5 space-y-4 shadow-xl">
                            <div className="border-b border-zinc-850 pb-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                                    Collegiate Protocols
                                </h4>
                                <p className="text-[10px] font-mono text-zinc-500">
                                    PORTFOLIO INTEGRITY
                                </p>
                            </div>

                            <div className="space-y-3 text-xs text-zinc-400">
                                <div className="border-l-2 border-[#fab818] pl-3 py-1 space-y-0.5">
                                    <p className="text-white font-bold text-[11px] uppercase tracking-wide">
                                        01. Public Builds
                                    </p>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                                        Milestones with live demos get 4x more team invites.
                                    </p>
                                </div>

                                <div className="border-l-2 border-zinc-700 pl-3 py-1 space-y-0.5">
                                    <p className="text-white font-bold text-[11px] uppercase tracking-wide">
                                        02. Code Integrity
                                    </p>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                                        Attach GitHub links for verified code review marks.
                                    </p>
                                </div>

                                <div className="border-l-2 border-zinc-700 pl-3 py-1 space-y-0.5">
                                    <p className="text-white font-bold text-[11px] uppercase tracking-wide">
                                        03. Hackathon Matching
                                    </p>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                                        State domain strengths in bio to pair with AI/Web3 squads.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </aside>

                </div>

            </main>

        </div>
    );
}

export default Profile;