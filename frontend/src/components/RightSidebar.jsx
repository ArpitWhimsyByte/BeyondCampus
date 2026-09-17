import { Link } from "react-router-dom";

function RightSidebar({ onTopicClick }) {
    const upcomingHackathons = [
        {
            name: "Smart India Hackathon 2026",
            date: "Next Month",
            prize: "₹1,00,000",
            tags: ["AI", "Smart Cities"],
        },
        {
            name: "ETHIndia Collegiate Hack",
            date: "In 2 Weeks",
            prize: "$5,000",
            tags: ["Web3", "Solidity"],
        },
        {
            name: "Devfolio Campus Sprint",
            date: "Open Now",
            prize: "Swag + Grants",
            tags: ["Full Stack", "Open Source"],
        },
    ];

    const trendingTopics = [
        { tag: "#PlacementSeason", posts: "240 posts" },
        { tag: "#HackathonTeammates", posts: "185 posts" },
        { tag: "#DSAinCpp", posts: "142 posts" },
        { tag: "#React19", posts: "98 posts" },
    ];

    return (
        <aside className="space-y-4">
            
            {/* Upcoming Hackathons Card */}
            <div className="bg-gradient-to-b from-[#18181d] to-[#121216] border border-white/[0.08] rounded-2xl shadow-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <h3 className="text-[11px] font-sans font-bold text-zinc-300 tracking-wider uppercase">
                        Spotlight Hackathons
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-amber-300/90 bg-amber-400/[0.08] border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fab818]" />
                        Featured
                    </span>
                </div>

                <div className="space-y-2.5">
                    {upcomingHackathons.map((hackathon, idx) => (
                        <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 space-y-2.5 cursor-pointer group"
                        >
                            {/* Top: Title & Date */}
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-[#fab818] transition-colors leading-snug">
                                    {hackathon.name}
                                </h4>
                                <span className="text-[10px] font-sans font-medium text-zinc-500 shrink-0">
                                    {hackathon.date}
                                </span>
                            </div>

                            {/* Bottom: Proportional Brand Gold Prize & Clean Tags */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#fab818]">
                                    <span className="text-[10px] text-zinc-500 font-normal">Prize</span>
                                    {hackathon.prize}
                                </span>

                                <div className="flex items-center gap-1.5">
                                    {hackathon.tags.map((t, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 bg-white/[0.04] rounded-md text-[10px] font-sans font-medium text-zinc-400 border border-white/[0.06]"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Campus Trends Card */}
            <div className="bg-gradient-to-b from-[#18181d] to-[#121216] border border-white/[0.08] rounded-2xl shadow-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <h3 className="text-[11px] font-sans font-bold text-zinc-300 tracking-wider uppercase">
                        Trending Topics
                    </h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fab818]" />
                </div>

                <div className="space-y-1">
                    {trendingTopics.map((topic, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => onTopicClick && onTopicClick(topic.tag.replace("#", ""))}
                            className="w-full flex items-center justify-between text-xs py-2 hover:bg-white/[0.04] px-2.5 rounded-xl cursor-pointer transition text-left group"
                        >
                            <span className="text-xs font-medium text-zinc-300 group-hover:text-[#fab818] transition-colors">
                                {topic.tag}
                            </span>
                            <span className="text-[11px] font-sans text-zinc-500">
                                {topic.posts}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Platform Footer */}
            <div className="px-3 text-[11px] font-sans text-zinc-500 space-y-1">
                <p>BeyondCampus &bull; Collegiate Network</p>
                <div className="flex gap-3 text-zinc-500">
                    <Link to="/profile" className="hover:text-zinc-300 transition">Profile</Link>
                    <Link to="/create-post" className="hover:text-zinc-300 transition">Post</Link>
                    <span>&copy; {new Date().getFullYear()}</span>
                </div>
            </div>

        </aside>
    );
}

export default RightSidebar;
