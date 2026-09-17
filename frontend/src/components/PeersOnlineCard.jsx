import { useState } from "react";

function PeersOnlineCard() {
    const [wavedPeers, setWavedPeers] = useState({});

    const peers = [
        { id: 1, name: "Aarav Sharma", college: "IIT Delhi", status: "Grinding DSA", initials: "AS" },
        { id: 2, name: "Priya Patel", college: "BITS Pilani", status: "Building AI MVP", initials: "PP" },
        { id: 3, name: "Rohan Verma", college: "VIT Vellore", status: "Looking for SIH Team", initials: "RV" },
        { id: 4, name: "Sneha Nair", college: "DTU Delhi", status: "Prepping Interviews", initials: "SN" },
        { id: 5, name: "Kabir Mehta", college: "NIT Trichy", status: "Web3 Hackathon", initials: "KM" }
    ];

    const handleWave = (peerId) => {
        setWavedPeers((prev) => ({ ...prev, [peerId]: true }));
        setTimeout(() => {
            setWavedPeers((prev) => ({ ...prev, [peerId]: false }));
        }, 2000);
    };

    return (
        <div className="bg-gradient-to-b from-[#18181d] to-[#121216] border border-white/[0.08] rounded-2xl shadow-xl p-4 space-y-3">
            {/* Header with Calm, Subtle Live Indicator */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <h3 className="text-[11px] font-sans font-bold text-zinc-300 tracking-wider uppercase">
                        Active Builders
                    </h3>
                </div>
                <span className="text-[11px] font-sans font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
                    24 online
                </span>
            </div>

            {/* Peer List */}
            <div className="space-y-1.5">
                {peers.map((peer) => (
                    <div
                        key={peer.id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition group"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-[#fab818] font-sans font-bold text-xs flex items-center justify-center border border-white/[0.1] shadow-inner">
                                    {peer.initials}
                                </div>
                                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#18181d]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-zinc-100 truncate group-hover:text-white transition">
                                    {peer.name}
                                </p>
                                <p className="text-[11px] font-sans text-zinc-400 truncate">
                                    {peer.college} &bull; {peer.status}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleWave(peer.id)}
                            title="Wave to peer"
                            className={`px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0 font-sans text-[11px] font-medium ${
                                wavedPeers[peer.id]
                                    ? "bg-[#fab818] text-slate-950 font-bold shadow-sm"
                                    : "bg-white/[0.04] hover:bg-[#fab818] hover:text-slate-950 border border-white/[0.08] hover:border-[#fab818] text-zinc-300"
                            }`}
                        >
                            {wavedPeers[peer.id] ? "Waved ✓" : "Wave 👋"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PeersOnlineCard;
