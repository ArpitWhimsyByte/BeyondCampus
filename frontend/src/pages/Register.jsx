import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import mascotImg from "../assets/husky_mascot.png";
import { registerUser } from "../services/authService";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullname: "",
        username: "",
        email: "",
        password: "",
        college: ""
    });

    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(true);

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

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size should be less than 5MB");
            return;
        }

        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!agreedToTerms) {
            setError("Please agree to the student terms & honor code.");
            return;
        }

        if (!avatar) {
            setError("Please upload a profile photo. An avatar is required to register.");
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();
            data.append("fullname", formData.fullname.trim());
            data.append("username", formData.username.trim());
            data.append("email", formData.email.trim());
            data.append("password", formData.password);
            data.append("avatar", avatar);

            await registerUser(data);

            setSuccess("Account created successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            let serverMessage = err.response?.data?.message;
            if (!serverMessage && typeof err.response?.data === "string" && !err.response.data.trim().startsWith("<")) {
                serverMessage = err.response.data;
            }
            if (!serverMessage) {
                serverMessage = err.message || "Registration failed. Please check your details and try again.";
            }
            setError(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#fab818] text-slate-900 flex flex-col lg:flex-row relative overflow-x-hidden font-sans selection:bg-teal-300 selection:text-slate-900">
            
            {/* Top-left Brand Logo (fixed position so it doesn't shift the form) */}
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
                    
                    {/* Big White Cursive "hello" */}
                    <div className="mb-2 select-none">
                        <span className="font-handwriting text-6xl sm:text-7xl lg:text-8xl text-white font-bold leading-none inline-block -rotate-2 drop-shadow-sm">
                            hello
                        </span>
                    </div>

                    {/* Headline & Subtitle */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            Register for BeyondCampus
                        </h1>
                        <p className="text-xs sm:text-sm font-bold text-amber-950/80 mt-1">
                            Think Beyond &bull; Build Beyond
                        </p>
                    </div>

                    {/* Error & Success Feedback Banners */}
                    {error && (
                        <div className="mb-4 p-3.5 rounded-xl bg-white border-2 border-rose-500 shadow-sm flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm font-bold animate-shake">
                            <span className="text-rose-500 text-base leading-none">&#9888;</span>
                            <span className="leading-tight">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3.5 rounded-xl bg-white border-2 border-emerald-500 shadow-sm flex items-start gap-2.5 text-emerald-800 text-xs sm:text-sm font-bold">
                            <span className="text-emerald-500 text-base leading-none">&#10004;</span>
                            <span className="leading-tight">{success}</span>
                        </div>
                    )}

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        
                        {/* 1. Full Name */}
                        <div>
                            <input
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                type="text"
                                placeholder="Full Name *"
                                required
                                className="w-full h-12 px-4 rounded-xl bg-white border border-amber-300/80 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-400/25 focus:border-teal-500 shadow-sm transition"
                            />
                        </div>

                        {/* 2. Username */}
                        <div>
                            <input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                type="text"
                                placeholder="Username *"
                                required
                                className="w-full h-12 px-4 rounded-xl bg-white border border-amber-300/80 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-400/25 focus:border-teal-500 shadow-sm transition"
                            />
                        </div>

                        {/* 3. Campus Email */}
                        <div>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="Campus Email *"
                                required
                                className="w-full h-12 px-4 rounded-xl bg-white border border-amber-300/80 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-400/25 focus:border-teal-500 shadow-sm transition"
                            />
                        </div>

                        {/* 4. Password with Toggle */}
                        <div className="relative">
                            <input
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password (min. 6 characters) *"
                                required
                                minLength={6}
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

                        {/* 5. College / University */}
                        <div className="relative">
                            <select
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                className="w-full h-12 px-4 pr-10 rounded-xl bg-white border border-amber-300/80 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-400/25 focus:border-teal-500 shadow-sm transition appearance-none"
                            >
                                <option value="">Select College / University (Optional)</option>
                                <option value="IIT Delhi">IIT Delhi</option>
                                <option value="DTU">DTU</option>
                                <option value="BITS Pilani">BITS Pilani</option>
                                <option value="IIT Bombay">IIT Bombay</option>
                                <option value="NSUT">NSUT</option>
                                <option value="IIIT Hyderabad">IIIT Hyderabad</option>
                                <option value="Other">Other College / University</option>
                            </select>
                            <svg
                                className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* 6. Profile Photo (Avatar) Picker */}
                        <div className="h-12 px-3.5 bg-white border border-amber-300/80 rounded-xl shadow-sm flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 border border-amber-200">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
                                    {avatar ? avatar.name : "Profile Photo (Avatar) *"}
                                </span>
                            </div>
                            <label className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-slate-900 font-bold text-xs rounded-lg cursor-pointer transition shrink-0">
                                Browse
                                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </label>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="pt-1">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="w-4 h-4 rounded text-[#00c9a7] accent-[#00c9a7] cursor-pointer"
                                />
                                <span className="text-xs font-bold text-slate-900">
                                    I agree to the BeyondCampus terms & honor code *
                                </span>
                            </label>
                        </div>

                        {/* NEXT / Submit Button & Sign In Link */}
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
                                        <span>CREATING ACCOUNT...</span>
                                    </>
                                ) : (
                                    <span>NEXT &rarr;</span>
                                )}
                            </button>

                            <p className="text-center text-xs sm:text-sm font-bold text-slate-900">
                                Already have an account?{" "}
                                <Link to="/login" className="underline hover:text-white transition">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>

                </div>

                {/* Bottom subtle text */}
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
                        Ready to Build Beyond?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        Join 5,000+ collegiate builders, find hackathon teammates, and unlock verified roadmaps.
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

export default Register;
