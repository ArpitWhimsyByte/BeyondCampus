import mascotImg from "../assets/husky_mascot.png";

function CampusMarquee() {
    const partners = [
        "IIT DELHI",
        "BITS PILANI",
        "SMART INDIA HACKATHON",
        "DEVFOLIO",
        "ETHINDIA",
        "VIT VELLORE",
        "DTU DELHI",
        "NIT TRICHY",
        "GITHUB CAMPUS",
        "STANFORD BASES"
    ];

    // Duplicate list for infinite seamless marquee loop
    const marqueeList = [...partners, ...partners];

    return (
        <div className="relative w-full overflow-hidden py-3 border-y border-white/5 bg-[#121215]">
            {/* Left & Right Gradient Fade Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#121215] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#121215] to-transparent z-10 pointer-events-none" />

            <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
                {marqueeList.map((partner, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-3.5 text-xs font-mono font-bold tracking-[0.2em] text-zinc-300 uppercase hover:text-[#fab818] transition cursor-default group"
                    >
                        <img
                            src={mascotImg}
                            alt="Husky"
                            className="w-5 h-5 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] group-hover:scale-125 group-hover:rotate-6 transition-transform duration-200 shrink-0 select-none"
                        />
                        <span>{partner}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CampusMarquee;

