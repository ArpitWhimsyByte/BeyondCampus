import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import mascotImg from "../assets/husky_mascot.png";

function PostSuccessTakeover() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isFading, setIsFading] = useState(false);

    const handleFinish = useCallback(() => {
        setIsFading(false);
        setIsOpen(false);
        if (location.pathname === "/create-post") {
            navigate("/");
        }
        setTimeout(() => {
            const feed = document.getElementById("feed-stream");
            if (feed) {
                feed.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    }, [navigate, location.pathname]);

    // Listen for global post-created event
    useEffect(() => {
        const onPostCreated = () => {
            setIsFading(false);
            setIsOpen(true);
        };

        window.addEventListener("post-created", onPostCreated);
        return () => window.removeEventListener("post-created", onPostCreated);
    }, []);

    // Timed lifecycle: Grow -> Tick pop -> Fade out -> Finish
    useEffect(() => {
        if (!isOpen) return;

        // Start smooth fade-out after 2.3s
        const fadeTimer = setTimeout(() => {
            setIsFading(true);
        }, 2300);

        // Complete celebration and transition to feed at 2.7s
        const closeTimer = setTimeout(() => {
            handleFinish();
        }, 2700);

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                handleFinish();
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(closeTimer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handleFinish]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer select-none transition-all duration-300 ${
                isFading ? "animate-celebration-fade-out" : "animate-fadeIn"
            }`}
            onClick={handleFinish}
            title="Click anywhere to skip"
        >
            {/* Center Celebration Staging: Smooth Husky Growth + Animated Tick */}
            <div className="relative flex flex-col items-center justify-center p-6">
                
                {/* Luminous Ambient Golden Halo */}
                <div className="absolute w-96 h-96 bg-gradient-to-r from-[#fab818]/25 via-amber-500/20 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute w-80 h-80 rounded-full border border-[#fab818]/20 animate-spin-slow pointer-events-none" />

                {/* Ground Shadow */}
                <div className="absolute bottom-16 w-56 h-8 bg-black/90 rounded-full blur-xl pointer-events-none" />

                {/* Smooth Husky Mascot Growing to Half-Screen Proportion */}
                <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 max-h-[48vh] flex items-center justify-center animate-husky-center-grow">
                    <img
                        src={mascotImg}
                        alt="Husky Celebration"
                        className="w-full h-full object-contain filter drop-shadow-[0_25px_50px_rgba(250,184,24,0.5)]"
                    />
                </div>

                {/* Animated Tick (Checkmark) + "Post Done" Indicator */}
                <div className="relative z-20 flex flex-col items-center gap-3 -mt-6 animate-tick-pop">
                    
                    {/* Glowing Circular Animated Checkmark Badge */}
                    <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.85)] border-2 border-white">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                                className="animate-checkmark-path"
                            />
                        </svg>
                    </div>

                    {/* Sharp Rectangular "Post Done" Badge */}
                    <div className="px-5 py-2 bg-black/95 border border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.35)] flex items-center gap-2.5">
                        <span className="w-2 h-2 bg-emerald-400 animate-ping" />
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
                            Post Done!
                        </span>
                        <span className="text-zinc-500 font-mono">&bull;</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                            Live on Feed
                        </span>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase mt-1">
                        Tap anywhere to view
                    </span>

                </div>

            </div>
        </div>
    );
}

export default PostSuccessTakeover;
