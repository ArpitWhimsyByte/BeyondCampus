import { useState } from "react";

function CommunitiesCard({ onSelectCircle }) {
    const [joinedCircles, setJoinedCircles] = useState({ 1: true });

    const communities = [
        {
            id: 1,
            name: "AI & ML Innovators",
            members: "148 members",
            icon: (
                <svg className="w-3.5 h-3.5 text-[#fab818]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            tag: "circles",
            avatars: ["A", "S", "M"]
        },
        {
            id: 2,
            name: "SIH Hackathon Squad",
            members: "86 members",
            icon: (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                </svg>
            ),
            tag: "hackathons",
            avatars: ["R", "K", "P"]
        },
        {
            id: 3,
            name: "Placement 2026 Batch",
            members: "310 members",
            icon: (
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            tag: "roadmaps",
            avatars: ["V", "N", "D"]
        },
        {
            id: 4,
            name: "Full Stack & Web3",
            members: "92 members",
            icon: (
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            ),
            tag: "circles",
            avatars: ["T", "J", "L"]
        }
    ];

    const toggleJoin = (circleId) => {
        setJoinedCircles((prev) => ({
            ...prev,
            [circleId]: !prev[circleId]
        }));
    };

    return (
        <div className="bg-gradient-to-b from-[#18181d] to-[#131317] border border-white/[0.08] rounded-2xl shadow-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-[11px] font-mono font-bold text-white tracking-[0.15em] uppercase">
                    Campus Communities
                </h3>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
                    Verified Hubs
                </span>
            </div>

            <div className="space-y-2.5">
                {communities.map((item) => {
                    const isJoined = !!joinedCircles[item.id];
                    return (
                        <div
                            key={item.id}
                            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition space-y-2"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-sm p-2 rounded-lg bg-black/40 border border-white/[0.08] shrink-0">
                                        {item.icon}
                                    </span>
                                    <div className="min-w-0">
                                        <h4
                                            onClick={() => onSelectCircle && onSelectCircle(item.tag)}
                                            className="text-xs font-bold text-white truncate hover:text-[#fab818] cursor-pointer transition"
                                        >
                                            {item.name}
                                        </h4>
                                        <p className="text-[10px] font-mono text-zinc-400">
                                            {item.members}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleJoin(item.id)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition cursor-pointer shrink-0 ${
                                        isJoined
                                            ? "bg-white/[0.06] text-zinc-300 border border-white/[0.1] hover:bg-white/[0.1]"
                                            : "bg-[#fab818] hover:bg-[#ffdb24] text-slate-950 shadow-md"
                                    }`}
                                >
                                    {isJoined ? "Joined ✓" : "+ Join"}
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] font-mono text-zinc-500">
                                <div className="flex -space-x-1.5 overflow-hidden">
                                    {item.avatars.map((av, i) => (
                                        <div
                                            key={i}
                                            className="w-4 h-4 rounded-full bg-zinc-800 text-[#fab818] ring-1 ring-[#18181d] font-mono font-bold text-[7px] flex items-center justify-center shrink-0"
                                        >
                                            {av}
                                        </div>
                                    ))}
                                </div>
                                <span>Active discussions</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CommunitiesCard;
