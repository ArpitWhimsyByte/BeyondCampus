import { useState, useEffect } from "react";
import mascotImg from "../assets/husky_mascot.png";

const QUOTES = [
    "Lock in bro, placement season waits for no one! 🔒",
    "No cap, that project idea you have is straight fire! 🔥",
    "Who's pulling an all-nighter for Smart India Hackathon? 🚀",
    "Bro debugged CSS for 3 hours and forgot a semicolon 💀",
    "W rizz on that hackathon pitch! Let him cook 👨‍🍳",
    "48 peers are grinding DSA right now... time to grind ⚡",
    "Click me for an instant campus aura boost! ✨",
    "Team up or solo? Real builders build in public! 🛠️",
    "Drop a banger post today and get noticed by campus leads! 🌟"
];

const BURST_EMOJIS = ["🔥", "🚀", "⚡", "💯", "👑", "✨", "🎉", "🐺"];

function HuskyCompanion() {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [isWiggling, setIsWiggling] = useState(false);
    const [confetti, setConfetti] = useState([]);
    const [auraCount, setAuraCount] = useState(500);
    const [minimized, setMinimized] = useState(false);
    const [showAuraToast, setShowAuraToast] = useState(false);

    // Auto-cycle speech bubble quotes every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Interactive click interaction: Wiggle + Confetti + Next Quote + Aura boost
    const handleHuskyClick = () => {
        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 500);

        // Advance quote
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length);

        // Boost aura
        setAuraCount((prev) => prev + 50);
        setShowAuraToast(true);
        setTimeout(() => setShowAuraToast(false), 1500);

        // Generate 6 burst particles
        const newParticles = Array.from({ length: 6 }).map((_, i) => ({
            id: Date.now() + i,
            emoji: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
            x: (Math.random() - 0.5) * 80,
            y: -30 - Math.random() * 50
        }));
        setConfetti(newParticles);
        setTimeout(() => setConfetti([]), 900);
    };

    if (minimized) {
        return (
            <button
                type="button"
                onClick={() => setMinimized(false)}
                title="Open Campus Wingman"
                className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-[#fab818] shadow-lg border-2 border-white ring-2 ring-amber-300 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition transform group"
            >
                <img
                    src={mascotImg}
                    alt="Husky"
                    className="w-9 h-9 object-contain group-hover:rotate-12 transition transform"
                />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00c9a7] border-2 border-white animate-ping" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-5 right-5 z-40 hidden sm:flex items-end gap-3 pointer-events-none select-none">
            {/* Speech Bubble */}
            <div className="relative pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200/90 max-w-xs text-xs font-semibold text-slate-800 animate-pop-in">
                {/* Close / Minimize Button */}
                <button
                    type="button"
                    onClick={() => setMinimized(true)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-black flex items-center justify-center hover:bg-rose-500 transition cursor-pointer shadow-xs"
                    title="Minimize"
                >
                    &times;
                </button>

                {/* Badge Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
                        <span>🐺</span> Campus Wingman
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        {auraCount} Aura
                    </span>
                </div>

                {/* Quote Text */}
                <p className="text-slate-700 leading-snug">
                    {QUOTES[quoteIndex]}
                </p>

                {/* Triangle Tail */}
                <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white border-r border-b border-slate-200/90 transform rotate-45" />
            </div>

            {/* Mascot Avatar Container */}
            <div className="relative pointer-events-auto shrink-0 flex flex-col items-center">
                {/* Floating Confetti Particles */}
                {confetti.map((particle) => (
                    <span
                        key={particle.id}
                        style={{
                            transform: `translate(${particle.x}px, ${particle.y}px)`,
                            transition: "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)"
                        }}
                        className="absolute text-lg pointer-events-none animate-float-up"
                    >
                        {particle.emoji}
                    </span>
                ))}

                {/* Aura Toast */}
                {showAuraToast && (
                    <span className="absolute -top-7 text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap animate-float-up pointer-events-none">
                        +50 Aura 🔥
                    </span>
                )}

                {/* Husky Avatar Button with floating animation */}
                <button
                    type="button"
                    onClick={handleHuskyClick}
                    title="Tap me for vibes!"
                    className={`w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#fab818] to-amber-200 p-2 shadow-xl border-2 border-white ring-2 ring-amber-300/60 cursor-pointer transform hover:scale-105 active:scale-95 transition ${
                        isWiggling ? "animate-wiggle" : "animate-float"
                    }`}
                >
                    <img
                        src={mascotImg}
                        alt="BeyondCampus Mascot"
                        className="w-full h-full object-contain filter drop-shadow-md"
                    />
                </button>
            </div>
        </div>
    );
}

export default HuskyCompanion;

