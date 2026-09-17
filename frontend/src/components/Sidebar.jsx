import { Link, useLocation } from "react-router-dom";

function Sidebar({ activeTab, onTabChange }) {
    const location = useLocation();

    const navItems = [
        {
            id: "all",
            label: "Campus Feed",
            path: "/",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            id: "hackathons",
            label: "Hackathons",
            path: "#hackathons",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            )
        },
        {
            id: "circles",
            label: "Campus Circles",
            path: "#circles",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: "roadmaps",
            label: "Roadmaps",
            path: "#roadmaps",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            id: "profile",
            label: "My Profile",
            path: "/profile",
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
    ];

    return (
        <aside className="w-full bg-gradient-to-b from-[#18181d] to-[#131317] border border-white/[0.08] rounded-2xl shadow-xl p-4 space-y-4">
            
            {/* Top Clean Section Header */}
            <div className="pb-2 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-sans font-bold tracking-wider text-zinc-400 uppercase">
                    Navigation
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#fab818]" />
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
                {navItems.map((item) => {
                    const isRoute = item.path.startsWith("/");
                    const isActive = isRoute
                        ? location.pathname === item.path && activeTab === "all"
                        : activeTab === item.id;

                    if (isRoute) {
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => onTabChange && onTabChange(item.id)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                                    isActive
                                        ? "bg-white/[0.08] text-[#fab818] font-bold border border-white/[0.1] shadow-sm"
                                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-white font-medium"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={isActive ? "text-[#fab818]" : "text-zinc-400"}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </div>
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#fab818]" />
                                )}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left cursor-pointer transition-all duration-200 ${
                                isActive
                                    ? "bg-white/[0.08] text-[#fab818] font-bold border border-white/[0.1] shadow-sm"
                                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white font-medium"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={isActive ? "text-[#fab818]" : "text-zinc-400"}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </div>
                            {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#fab818]" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Direct Create Post Action */}
            <div className="pt-2 border-t border-white/[0.06]">
                <Link
                    to="/create-post"
                    className="w-full h-10 rounded-xl bg-gradient-to-r from-[#fab818] to-[#f59e0b] hover:from-[#ffc43a] hover:to-[#fbbf24] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,184,24,0.2)] hover:shadow-[0_0_25px_rgba(250,184,24,0.35)] transition transform active:scale-95"
                >
                    <span className="w-4 h-4 rounded-full bg-slate-950 text-[#fab818] flex items-center justify-center text-[10px] font-black">
                        +
                    </span>
                    <span>Create Post</span>
                </Link>
            </div>

            {/* Platform Hub Box */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 space-y-1.5">
                <div className="flex items-center gap-2 font-sans font-semibold text-white text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#fab818]" />
                    <span>Collegiate Engine</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                    Over 5,000 verified students building across campuses.
                </p>
            </div>

        </aside>
    );
}

export default Sidebar;
