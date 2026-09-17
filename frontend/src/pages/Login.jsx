import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import mascotImg from "../assets/husky_mascot.png";
import { loginUser } from "../services/authService";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        identifier: "", // Can be email or username
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const identifier = formData.identifier.trim();
        const password = formData.password;

        if (!identifier || !password) {
            setError("Please enter both email/username and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await loginUser({
                username: identifier,
                email: identifier,
                password: password
            });

            if (response?.data?.user) {
                localStorage.setItem("beyondcampus_user", JSON.stringify(response.data.user));
            } else if (response?.data) {
                localStorage.setItem("beyondcampus_user", JSON.stringify(response.data));
            }

            setSuccess("Login successful! Redirecting to home feed...");

            setTimeout(() => {
                navigate("/");
            }, 1200);
        } catch (err) {
            const serverMessage =
                err.response?.data?.message ||
                (typeof err.response?.data === "string" ? err.response?.data : null) ||
                err.message ||
                "Invalid username, email, or password. Please try again.";
            setError(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#fab818] text-slate-900 flex flex-col lg:flex-row relative overflow-x-hidden font-sans selection:bg-teal-300 selection:text-slate-900">
            
            {/* Top-left Brand Logo */}
            <header className="absolute top-6 left-6 sm:left-10 lg:left-14 z-20">
                <Link to="/" className="inline-flex items-center gap-2 group">
                    <span className="text-xl font-black tracking-tight text-slate-900">
                        BeyondCampus
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/90 px-2 py-0.5 rounded-full text-amber-950">
                        Student Hub
                    </span>
                </Link>
            </header>

            {/* =====================================================
                LEFT HALF: WARM YELLOW CANVAS (FORM CENTERED)
            ====================================================== */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-14 py-20 lg:py-12 relative z-10">
                
                {/* Centered Form Container */}
                <div className="w-full max-w-[460px]">
                    
                    {/* Big White Cursive "welcome back" */}
                    <div className="mb-2 select-none">
                        <span className="font-handwriting text-5xl sm:text-6xl lg:text-7xl text-white font-bold leading-none inline-block -rotate-2 drop-shadow-sm">
                            welcome back
                        </span>
                    </div>

                    {/* Headline & Subtitle */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            Sign in to BeyondCampus
                        </h1>
                        <p className="text-xs sm:text-sm font-bold text-amber-950/80 mt-1">
                            Think Beyond &bull; Build Beyond
                        </p>
                    </div>

                    {/* Error & Success Feedback Banners */}
                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl bg-white border-2 border-rose-500 shadow-sm flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm font-bold animate-shake">
                            <span className="text-rose-500 text-base leading-none">&#9888;</span>
                            <span className="leading-tight">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 p-3.5 rounded-xl bg-white border-2 border-emerald-500 shadow-sm flex items-start gap-2.5 text-emerald-800 text-xs sm:text-sm font-bold">
                            <span className="text-emerald-500 text-base leading-none">&#10004;</span>
                            <span className="leading-tight">{success}</span>
                        </div>
                    )}

                    {/* Form: Enforced 24px Gap Between Inputs */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        
                        {/* 1. Email or Username */}
                        <div>
                            <input
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                type="text"
                                placeholder="Campus Email or Username *"
                                required
                                autoFocus
                                className="w-full h-12 px-4 rounded-xl bg-white border border-amber-300/80 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-400/25 focus:border-teal-500 shadow-sm transition"
                            />
                        </div>

                        {/* 2. Password with Toggle */}
                        <div className="relative">
                            <input
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password *"
                                required
                                className="w-full h-12 px-4 pr-11 rounded-xl bg-white border border-amber-300/80 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-400/25 focus:border-teal-500 shadow-sm transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* 3. Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-xs select-none">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded text-[#00c9a7] accent-[#00c9a7] cursor-pointer"
                                />
                                <span className="font-bold text-slate-900">
                                    Remember me
                                </span>
                            </label>

                            <a
                                href="#forgot-password"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert("Please contact support or reset password via your campus administrator.");
                                }}
                                className="font-bold text-slate-900 hover:text-white underline transition"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* 4. Sign In Button & Register Link */}
                        <div className="pt-2 flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#00c9a7] hover:bg-[#00b596] active:bg-[#009e83] disabled:bg-teal-200 text-slate-950 font-black text-sm tracking-wider uppercase rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-slate-900" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        <span>SIGNING IN...</span>
                                    </>
                                ) : (
                                    <span>SIGN IN &rarr;</span>
                                )}
                            </button>

                            <p className="text-center text-xs sm:text-sm font-bold text-slate-900">
                                Don&apos;t have an account?{" "}
                                <Link to="/register" className="underline hover:text-white transition">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </form>

                </div>

                {/* Bottom subtle note */}
                <div className="absolute bottom-4 left-6 sm:left-10 lg:left-14 text-[11px] font-bold text-amber-950/60 hidden sm:block">
                    &copy; {new Date().getFullYear()} BeyondCampus
                </div>
            </div>

            {/* =====================================================
                RIGHT HALF: PURE WHITE CANVAS WITH SWEEPING CURVE
                (Husky Mascot Hero)
            ====================================================== */}
            <div className="lg:w-[46%] xl:w-[44%] bg-white rounded-t-[48px] lg:rounded-t-none lg:rounded-l-[110px] xl:rounded-l-[150px] shadow-2xl flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 relative z-10">
                
                {/* Official Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider mb-8 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00c9a7] animate-pulse" />
                    Official Student Network
                </div>

                {/* Hero Mascot Graphic */}
                <div className="w-56 sm:w-68 lg:w-80 flex items-center justify-center p-2 relative">
                    <div className="absolute inset-0 bg-amber-100/70 rounded-full blur-3xl -z-10" />
                    <img
                        src={mascotImg}
                        alt="BeyondCampus Mascot"
                        className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                    />
                </div>

                {/* Headline & Description */}
                <div className="mt-8 text-center space-y-2 max-w-sm">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Welcome Back, Builder!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        Catch up on your collegiate circles, hackathon discussions, and placement archives.
                    </p>
                </div>

                {/* Verified campus pill */}
                <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                    <span>🎓 Verified students across 140+ campuses</span>
                </div>
            </div>

        </div>
    );
}

export default Login;