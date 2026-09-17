import mascotImg from "../assets/husky_mascot.png";

function WelcomeBanner({ onFocusComposer, postCount = 0 }) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-200 border border-amber-300/80 p-5 sm:p-6 shadow-sm">
            {/* Background Decorative Circles */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/20 blur-xl pointer-events-none" />
            <div className="absolute left-1/3 -top-10 w-32 h-32 rounded-full bg-amber-200/40 blur-lg pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Text & Stats Section */}
                <div className="space-y-3 max-w-md">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider">
                            <span>🔥</span> 5-Day Builder Streak
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                            Welcome back, Builder 👋
                        </h1>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                            Connect with verified peers, team up for hackathons, and solve engineering doubts together.
                        </p>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-white/60 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{postCount || "140+"} Posts</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-white/60 shadow-2xs">
                            <span>🚀</span>
                            <span>3 Live Hacks</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-white/60 shadow-2xs">
                            <span>⚡</span>
                            <span>850+ Online</span>
                        </div>
                    </div>
                </div>

                {/* Husky Mascot Peek & Quick Action */}
                <div className="flex items-center sm:flex-col items-end gap-3 shrink-0 self-end sm:self-center">
                    <div className="relative group cursor-pointer" onClick={onFocusComposer}>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/70 p-2 border-2 border-white shadow-md flex items-center justify-center transform group-hover:scale-105 group-hover:-rotate-3 transition duration-200">
                            <img
                                src={mascotImg}
                                alt="BeyondCampus Husky"
                                className="w-full h-full object-contain filter drop-shadow-sm animate-float-subtle"
                            />
                        </div>
                        <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-slate-950 text-[#fab818] text-[9px] font-black uppercase tracking-wider shadow-xs">
                            Ready
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onFocusComposer}
                        className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 active:bg-black text-[#fab818] text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                        Share an Update &rarr;
                    </button>
                </div>

            </div>
        </div>
    );
}

export default WelcomeBanner;

