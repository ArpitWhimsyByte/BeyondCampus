import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/BeyondCampusLogo.png";
import { logoutUser } from "../services/authService";

function Navbar({ onOpenMobileMenu, searchQuery = "", onSearch, activeTab, onTabChange }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searchQuery);
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            navigate("/login");
        }
    };

    const navLinks = [
        { id: "all", label: "Campus Feed" },
        { id: "hackathons", label: "Hackathons" },
        { id: "circles", label: "Campus Circles" },
        { id: "roadmaps", label: "Roadmaps" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0c0c0e]/85 border-b border-white/[0.08] transition-all">
            <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 h-18 flex items-center justify-between gap-4">
                
                {/* Left: Brand Logo & Title */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenMobileMenu}
                        className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                        aria-label="Open navigation menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 p-1.5 flex items-center justify-center group-hover:border-[#fab818]/60 transition shadow-sm">
                            <img
                                src={logo}
                                alt="BeyondCampus Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-black tracking-tight text-white group-hover:text-[#fab818] transition">
                                    BeyondCampus
                                </span>
                                <span className="hidden sm:inline-flex text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 bg-[#fab818]/10 text-[#fab818] border border-[#fab818]/25">
                                    2026
                                </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 -mt-0.5 hidden sm:block">
                                Collegiate Tech Platform
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Center: Sharp Rectangular Navigation Bar */}
                <nav className="hidden lg:flex items-center p-1 border border-zinc-800 bg-[#111114]">
                    {navLinks.map((link) => {
                        const isSelected = activeTab === link.id;
                        return (
                            <button
                                key={link.id}
                                type="button"
                                onClick={() => {
                                    if (onTabChange) onTabChange(link.id);
                                    const feed = document.getElementById("feed-stream");
                                    if (feed) feed.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                                    isSelected
                                        ? "bg-[#fab818] text-slate-950 shadow-sm"
                                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                                }`}
                            >
                                {link.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Right: Frosted Search + "+ New Post" Action Button + Profile */}
                <div className="flex items-center gap-3">
                    
                    {/* Sharp Rectangular Search Input */}
                    <form
                        onSubmit={handleSearch}
                        className="relative hidden sm:flex items-center"
                    >
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                            placeholder="Search campus discussions..."
                            className="w-44 md:w-56 lg:w-64 h-9 pl-9 pr-12 bg-white/[0.03] border border-zinc-800 hover:border-zinc-700 focus:border-[#fab818] focus:bg-[#111114] text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-all font-mono"
                        />
                        <svg className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => onSearch && onSearch("")}
                                className="absolute right-3 text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                            >
                                &times;
                            </button>
                        ) : (
                            <kbd className="absolute right-2.5 text-[10px] font-mono text-zinc-500 bg-white/[0.06] border border-zinc-800 px-1.5 py-0.5 pointer-events-none hidden md:inline-block">
                                ⌘K
                            </kbd>
                        )}
                    </form>

                    {/* "+ New Post" Sharp Rectangular Button */}
                    <Link
                        to="/create-post"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#fab818] hover:bg-[#ffdb24] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                    >
                        <span className="w-3.5 h-3.5 bg-slate-950 text-[#fab818] flex items-center justify-center text-[10px] font-mono font-bold leading-none">
                            +
                        </span>
                        <span className="hidden sm:inline">New Post</span>
                    </Link>

                    {/* User Profile Trigger with Status Dot */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="relative w-9 h-9 bg-zinc-900 border border-zinc-800 hover:border-[#fab818] text-[#fab818] font-mono font-bold text-xs flex items-center justify-center cursor-pointer transition"
                        >
                            BC
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-black" />
                        </button>

                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-[#111114] border border-zinc-800 shadow-2xl py-1.5 z-50">
                                    <div className="px-4 py-2 border-b border-zinc-800">
                                        <p className="text-xs font-bold text-white">Student Builder</p>
                                        <p className="text-[10px] text-zinc-400 truncate">Connected Session</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="block px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        to="/create-post"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="block px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                    >
                                        Create Post
                                    </Link>
                                    <div className="border-t border-zinc-800 my-1" />
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                </div>

            </div>
        </header>
    );
}

export default Navbar;
