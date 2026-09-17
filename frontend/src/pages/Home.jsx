import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ShowcaseHero from "../components/ShowcaseHero";
import CampusMarquee from "../components/CampusMarquee";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import CreatePostCard from "../components/CreatePostCard";
import PostCard from "../components/PostCard";
import PeersOnlineCard from "../components/PeersOnlineCard";
import CommunitiesCard from "../components/CommunitiesCard";
import { getAllPosts } from "../services/postService";
import mascotImg from "../assets/husky_mascot.png";

function Home() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch all posts on mount
    const fetchPosts = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            setError("");

            const response = await getAllPosts();
            if (response && Array.isArray(response.data)) {
                setPosts(response.data);
            } else if (Array.isArray(response)) {
                setPosts(response);
            } else {
                setPosts([]);
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load campus feed. Please check backend connection."
            );
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Sync tab and search filters from URL query parameters (e.g. from Navbar on another page)
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam && ["all", "hackathons", "circles", "roadmaps"].includes(tabParam)) {
            setActiveTab(tabParam);
            setTimeout(() => {
                document.getElementById("feed-stream")?.scrollIntoView({ behavior: "smooth" });
            }, 150);
        }
        const searchParam = searchParams.get("search");
        if (searchParam !== null) {
            setSearchQuery(searchParam);
            setTimeout(() => {
                document.getElementById("feed-stream")?.scrollIntoView({ behavior: "smooth" });
            }, 150);
        }
    }, [searchParams]);

    // Prepend newly created post to top of feed
    const handlePostCreated = (newPost) => {
        setPosts((prev) => [newPost, ...prev]);
        setActiveTab("all");
        setSearchQuery("");
        document.getElementById("feed-stream")?.scrollIntoView({ behavior: "smooth" });
    };

    // Filter out deleted post from feed
    const handlePostDeleted = (deletedPostId) => {
        setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
    };

    // Update post likes/data when updated from PostCard
    const handlePostUpdated = (postId, updateData) => {
        setPosts((prev) =>
            prev.map((p) => {
                if (p._id === postId) {
                    return {
                        ...p,
                        likes: updateData.likes || p.likes,
                    };
                }
                return p;
            })
        );
    };

    // Quick scroll to create post section and focus input
    const handleScrollToCreate = () => {
        const el = document.getElementById("create-post-section");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            const input = el.querySelector("input");
            if (input) input.focus();
        } else {
            navigate("/create-post");
        }
    };

    // Filtering logic based on category tab & search query
    const filteredPosts = useMemo(() => {
        let list = posts;

        if (activeTab === "hackathons") {
            const keywords = ["hackathon", "sih", "devfolio", "ethindia", "competition", "prize", "cash", "code"];
            list = list.filter((p) => {
                const combined = `${p.title || ""} ${p.content || ""}`.toLowerCase();
                return keywords.some((kw) => combined.includes(kw));
            });
        } else if (activeTab === "circles") {
            const keywords = ["circle", "club", "team", "meetup", "peer", "study", "batch", "discord"];
            list = list.filter((p) => {
                const combined = `${p.title || ""} ${p.content || ""}`.toLowerCase();
                return keywords.some((kw) => combined.includes(kw));
            });
        } else if (activeTab === "roadmaps") {
            const keywords = ["roadmap", "placement", "dsa", "interview", "guide", "leetcode", "resume", "tips"];
            list = list.filter((p) => {
                const combined = `${p.title || ""} ${p.content || ""}`.toLowerCase();
                return keywords.some((kw) => combined.includes(kw));
            });
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            list = list.filter((p) => {
                const title = (p.title || "").toLowerCase();
                const content = (p.content || "").toLowerCase();
                const authorName = (p.author?.fullname || p.author?.username || "").toLowerCase();
                return title.includes(query) || content.includes(query) || authorName.includes(query);
            });
        }

        return list;
    }, [posts, activeTab, searchQuery]);

    const tabs = [
        { id: "all", label: "All Updates" },
        { id: "hackathons", label: "Hackathons" },
        { id: "circles", label: "Campus Circles" },
        { id: "roadmaps", label: "Roadmaps" },
    ];

    return (
        <div className="min-h-screen w-full bg-[#0c0c0e] text-white flex flex-col font-sans antialiased selection:bg-[#fab818] selection:text-black">
            
            {/* Top Fixed Island Navbar */}
            <Navbar
                onOpenMobileMenu={() => setMobileMenuOpen(true)}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Showcase Hero with Floating 3D Mascot & Architectural Cards */}
            <ShowcaseHero
                onJumpFeed={() => {
                    document.getElementById("feed-stream")?.scrollIntoView({ behavior: "smooth" });
                }}
                onSelectCategory={(cat) => {
                    setActiveTab(cat);
                    document.getElementById("feed-stream")?.scrollIntoView({ behavior: "smooth" });
                }}
            />

            {/* Continuous Infinite Campus Marquee */}
            <CampusMarquee />

            {/* Main 3-Column Feed Workspace (Full Width, Centered Max Container) */}
            <div id="feed-stream" className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex gap-6 lg:gap-8 items-start justify-center">
                    
                    {/* Left Sticky Column: Navigation + Active Builders */}
                    <aside className="hidden lg:flex flex-col gap-5 w-64 xl:w-72 shrink-0 sticky top-20 self-start">
                        <Sidebar
                            activeTab={activeTab}
                            onTabChange={(tabId) => {
                                setActiveTab(tabId);
                                setSearchQuery("");
                            }}
                        />

                        <PeersOnlineCard />
                    </aside>

                    {/* Center Community Feed Stream */}
                    <main className="flex-1 max-w-3xl min-w-0 w-full flex flex-col gap-5 pb-24 lg:pb-8">
                        
                        {/* Feed Filter Tabs & Refresh */}
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                                {tabs.map((tab) => {
                                    const isSelected = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setSearchQuery("");
                                            }}
                                            className={`inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-semibold whitespace-nowrap transition cursor-pointer ${
                                                isSelected
                                                    ? "bg-[#fab818] text-slate-950 shadow-md font-bold"
                                                    : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16]"
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Refresh Feed Button */}
                            <button
                                type="button"
                                onClick={() => fetchPosts(true)}
                                disabled={loading || isRefreshing}
                                title="Refresh feed"
                                className="shrink-0 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] text-zinc-400 hover:text-white transition cursor-pointer disabled:opacity-50"
                            >
                                <svg
                                    className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#fab818]" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        {/* Search / Filter Active Indicator */}
                        {(searchQuery.trim() || activeTab !== "all") && (
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-sans text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#fab818]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>
                                        Filter:{" "}
                                        <strong className="text-white">
                                            {searchQuery ? `"${searchQuery}"` : tabs.find((t) => t.id === activeTab)?.label}
                                        </strong>{" "}
                                        <span className="text-zinc-500">({filteredPosts.length} posts found)</span>
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setActiveTab("all");
                                    }}
                                    className="text-[#fab818] hover:underline font-bold cursor-pointer text-xs"
                                >
                                    Clear filter
                                </button>
                            </div>
                        )}

                        {/* Architectural Rectangular Post Composer Box */}
                        <CreatePostCard onPostCreated={handlePostCreated} />

                        {/* Error State Banner */}
                        {error && (
                            <div className="p-4 rounded-xl bg-[#18181d] border border-rose-500/40 text-rose-400 flex items-center justify-between gap-3 shadow-xl">
                                <div>
                                    <h3 className="text-xs font-mono font-bold text-rose-300">
                                        // UNABLE TO RETRIEVE POSTS
                                    </h3>
                                    <p className="text-xs text-rose-400/90 mt-0.5">{error}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fetchPosts()}
                                    className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Loading State Skeletons */}
                        {loading && !error && (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-[#18181d] border border-zinc-700/80 rounded-xl p-5 space-y-4 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800" />
                                            <div className="space-y-1.5 flex-1">
                                                <div className="h-3 w-32 bg-zinc-800 rounded" />
                                                <div className="h-2 w-20 bg-zinc-800 rounded" />
                                            </div>
                                        </div>
                                        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                                        <div className="space-y-1.5">
                                            <div className="h-3 w-full bg-zinc-800 rounded" />
                                            <div className="h-3 w-5/6 bg-zinc-800 rounded" />
                                        </div>
                                        <div className="h-40 w-full bg-zinc-800 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty Feed State */}
                        {!loading && !error && filteredPosts.length === 0 && (
                            <div className="bg-[#18181d] border border-zinc-700/80 rounded-xl p-8 sm:p-10 text-center flex flex-col items-center gap-4 shadow-xl">
                                <div className="w-20 h-20 rounded-xl bg-zinc-800 border border-zinc-700 p-2.5 flex items-center justify-center animate-float-3d">
                                    <img
                                        src={mascotImg}
                                        alt="BeyondCampus Mascot"
                                        className="w-full h-full object-contain filter drop-shadow-md"
                                    />
                                </div>
                                <div className="space-y-1 max-w-sm">
                                    <h3 className="text-base font-bold text-white">
                                        {searchQuery || activeTab !== "all"
                                            ? "No matching posts found"
                                            : "No collegiate discussions yet"}
                                    </h3>
                                    <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                        {searchQuery || activeTab !== "all"
                                            ? "// Try adjusting your search query or reset filter"
                                            : "// Be the first engineer to start a discussion or find teammates"}
                                    </p>
                                </div>
                                <div>
                                    {searchQuery || activeTab !== "all" ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery("");
                                                setActiveTab("all");
                                            }}
                                            className="px-5 py-2.5 rounded-lg bg-[#fab818] hover:bg-[#ffdb24] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                                        >
                                            View All Posts
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleScrollToCreate}
                                            className="px-5 py-2.5 rounded-lg bg-[#fab818] hover:bg-[#ffdb24] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
                                        >
                                            Publish First Post &rarr;
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Populated Post Feed List */}
                        {!loading && !error && filteredPosts.length > 0 && (
                            <div className="flex flex-col gap-4">
                                {filteredPosts.map((post) => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        onPostDeleted={handlePostDeleted}
                                        onPostUpdated={handlePostUpdated}
                                    />
                                ))}
                            </div>
                        )}

                    </main>

                    {/* Right Sticky Column: Spotlight Hacks + Communities */}
                    <aside className="hidden xl:flex flex-col gap-5 w-80 xl:w-[340px] 2xl:w-[360px] shrink-0 sticky top-20 self-start">
                        <RightSidebar
                            onTopicClick={(topic) => setSearchQuery(topic)}
                        />

                        <CommunitiesCard
                            onSelectCircle={(tabId) => {
                                setActiveTab(tabId);
                                setSearchQuery("");
                                document.getElementById("feed-stream")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        />
                    </aside>

                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#111114] border-r border-zinc-800 shadow-2xl p-5 flex flex-col justify-between z-50 overflow-y-auto">
                        <div className="space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                                <span className="text-base font-bold text-white font-mono">BeyondCampus // 2026</span>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <Sidebar
                                activeTab={activeTab}
                                onTabChange={(tabId) => {
                                    setActiveTab(tabId);
                                    setSearchQuery("");
                                    setMobileMenuOpen(false);
                                }}
                            />

                            <PeersOnlineCard />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Fixed Bottom Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111114]/95 backdrop-blur-md border-t border-zinc-800 px-4 py-2 flex items-center justify-around shadow-2xl">
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("all");
                        setSearchQuery("");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono font-bold transition cursor-pointer ${
                        activeTab === "all" ? "text-[#fab818]" : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Feed</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("hackathons");
                        setSearchQuery("");
                    }}
                    className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono font-bold transition cursor-pointer ${
                        activeTab === "hackathons" ? "text-[#fab818]" : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Hacks</span>
                </button>

                {/* Mobile Create Action Button */}
                <button
                    type="button"
                    onClick={handleScrollToCreate}
                    className="w-10 h-10 rounded-full bg-[#fab818] hover:bg-[#ffdb24] text-slate-950 font-black text-xl flex items-center justify-center shadow-lg transition cursor-pointer"
                    aria-label="Create Post"
                >
                    +
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("circles");
                        setSearchQuery("");
                    }}
                    className={`flex flex-col items-center gap-1 p-1 text-[10px] font-mono font-bold transition cursor-pointer ${
                        activeTab === "circles" ? "text-[#fab818]" : "text-zinc-400 hover:text-white"
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Circles</span>
                </button>

                <Link
                    to="/profile"
                    className="flex flex-col items-center gap-1 p-1 text-[10px] font-mono font-bold text-zinc-400 hover:text-white transition"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                </Link>
            </nav>

        </div>
    );
}

export default Home;