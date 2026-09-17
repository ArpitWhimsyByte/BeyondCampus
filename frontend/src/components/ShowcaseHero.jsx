import { useState, useEffect } from "react";
import mascotImg from "../assets/husky_mascot.png";

function ShowcaseHero({ onJumpFeed, onSelectCategory }) {
    const [isDancing, setIsDancing] = useState(false);

    useEffect(() => {
        const handlePostCreated = () => {
            setIsDancing(true);
            setTimeout(() => setIsDancing(false), 5500);
        };
        window.addEventListener("post-created", handlePostCreated);
        return () => window.removeEventListener("post-created", handlePostCreated);
    }, []);
    return (
        <section className="relative w-full px-4 sm:px-8 lg:px-12 pt-10 pb-8 overflow-hidden bg-gradient-to-b from-[#111114] via-[#0d0d10] to-[#0c0c0e]">
            
            {/* Ambient Lighting Gradients */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#fab818]/8 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Row: Editorial Headline + Seamlessly Blended 3D Husky Mascot */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 max-w-[1536px] mx-auto">
                
                {/* Headline & Description */}
                <div className="max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-[#fab818]">
                        <span className="w-1.5 h-1.5 bg-[#fab818]" />
                        <span>Collegiate Tech Platform &bull; 2026</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                        There is a <br />
                        <span className="text-[#fab818]">Better Way</span> to Build.
                    </h1>

                    <p className="text-sm sm:text-base text-zinc-300 max-w-lg leading-relaxed font-normal">
                        Connect with 5,000+ verified collegiate engineers across top universities. Team up for hackathons, share roadmaps, and solve engineering doubts together.
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onJumpFeed}
                            className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-[#fab818] transition-all cursor-pointer shadow-lg"
                        >
                            <span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[10px] font-mono font-black">
                                &gt;
                            </span>
                            <span>Explore Feed</span>
                        </button>

                        <span className="text-xs text-zinc-400 font-sans">
                            140+ active discussions today
                        </span>
                    </div>
                </div>

                {/* Seamlessly Blended Floating Mascot with Cinematic Depth */}
                <div className="relative shrink-0 flex items-center justify-center lg:pr-6">
                    {/* Soft ambient back light */}
                    <div className="absolute w-72 h-72 bg-radial from-[#fab818]/25 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Tech radar concentric subtle rings */}
                    <div className="absolute w-64 h-64 rounded-full border border-[#fab818]/15 animate-spin-slow pointer-events-none" />
                    <div className="absolute w-52 h-52 rounded-full border border-dashed border-white/10 pointer-events-none" />

                    {/* Ground floor shadow */}
                    <div className="absolute -bottom-5 w-48 h-8 bg-black/80 rounded-full blur-xl pointer-events-none" />

                    {/* Floating Mascot with Celebration Glow */}
                    <div
                        className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center cursor-pointer group animate-float-3d"
                        onClick={onJumpFeed}
                    >
                        {/* Celebratory Speech Bubble */}
                        {isDancing && (
                            <div className="absolute -top-12 z-30 px-4 py-2 bg-[#fab818] text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl animate-bounce flex items-center gap-2 whitespace-nowrap border border-white">
                                <span>WOOF! New post live! 🐾</span>
                            </div>
                        )}
                        <img
                            src={mascotImg}
                            alt="BeyondCampus Husky"
                            className={`w-full h-full object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.8)] transition duration-500 ${
                                isDancing
                                    ? "scale-110 filter drop-shadow-[0_0_35px_rgba(250,184,24,0.7)]"
                                    : "group-hover:scale-105"
                            }`}
                        />
                    </div>
                </div>

            </div>

            {/* Three Architectural Cards Grid (/ 01, / 02, / 03) */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 max-w-[1536px] mx-auto">
                
                {/* Card 1 (Featured Golden Rectangular Card) */}
                <div className="group relative bg-gradient-to-b from-[#191610] via-[#141312] to-[#101013] border border-[#fab818]/40 hover:border-[#fab818] p-6 flex flex-col justify-between space-y-6 shadow-2xl hover:-translate-y-0.5 transition-all duration-200">
                    {/* Golden top accent highlight bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#fab818]" />
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                            <span className="text-xs font-mono font-bold tracking-[0.15em] text-[#fab818] uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#fab818] animate-pulse" />
                                <span>Featured Feed</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#fab818] bg-[#fab818]/10 border border-[#fab818]/30 px-2 py-0.5 uppercase tracking-wider">
                                Live Feed
                            </span>
                        </div>

                        {/* Sharp Rectangular Icon Badge */}
                        <div className="w-10 h-10 border border-[#fab818]/40 bg-[#fab818]/10 flex items-center justify-center text-[#fab818]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>

                        <div>
                            <h3 className="text-base font-black text-white tracking-tight leading-snug group-hover:text-[#fab818] transition">
                                Campus Feed &amp; Real-time Doubts
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-2 font-normal">
                                Share live updates, get code reviewed by peers, and discuss placement algorithms in real-time.
                            </p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={onJumpFeed}
                            className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#fab818] hover:bg-[#ffdb24] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                        >
                            <span className="w-3.5 h-3.5 bg-slate-950 text-[#fab818] flex items-center justify-center text-[9px] font-black">
                                &gt;
                            </span>
                            <span>Jump to Feed</span>
                        </button>
                    </div>
                </div>

                {/* Card 2 (Sharp Dark Rectangular Hackathon Sprint Card) */}
                <div className="group relative bg-[#111114] border border-zinc-850 hover:border-zinc-700 p-6 flex flex-col justify-between space-y-6 shadow-2xl hover:-translate-y-0.5 transition-all duration-200">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                            <span className="text-xs font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">
                                Hackathon Sprint
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 uppercase tracking-wider">
                                ₹1,00,000 Pool
                            </span>
                        </div>

                        {/* Sharp Rectangular Trophy Icon Badge */}
                        <div className="w-10 h-10 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-amber-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                            </svg>
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-[#fab818] transition">
                                Smart India Hackathon 2026
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-2 font-normal">
                                Form your multidisciplinary squad across AI, Web3, and Hardware domains.
                            </p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() => onSelectCategory("hackathons")}
                            className="inline-flex items-center gap-2.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                            <span className="w-3.5 h-3.5 bg-zinc-800 text-white group-hover:bg-[#fab818] group-hover:text-black flex items-center justify-center text-[9px] font-black transition">
                                &gt;
                            </span>
                            <span>Team Up</span>
                        </button>
                    </div>
                </div>

                {/* Card 3 (Sharp Dark Rectangular Campus Circles Card) */}
                <div className="group relative bg-[#111114] border border-zinc-850 hover:border-zinc-700 p-6 flex flex-col justify-between space-y-6 shadow-2xl hover:-translate-y-0.5 transition-all duration-200">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                            <span className="text-xs font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">
                                Campus Circles
                            </span>
                            <span className="text-[10px] font-mono font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 uppercase tracking-wider">
                                310 Members
                            </span>
                        </div>

                        {/* Sharp Rectangular Shield Icon Badge */}
                        <div className="w-10 h-10 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-[#fab818]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-amber-400 transition">
                                Placement &amp; Circles
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-2 font-normal">
                                Curated DSA interview roadmaps, peer mock rounds, and system design masterclasses.
                            </p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() => onSelectCategory("roadmaps")}
                            className="inline-flex items-center gap-2.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                            <span className="w-3.5 h-3.5 bg-zinc-800 text-white group-hover:bg-[#fab818] group-hover:text-black flex items-center justify-center text-[9px] font-black transition">
                                &gt;
                            </span>
                            <span>Explore Roadmaps</span>
                        </button>
                    </div>
                </div>

            </div>

        </section>
    );
}

export default ShowcaseHero;
