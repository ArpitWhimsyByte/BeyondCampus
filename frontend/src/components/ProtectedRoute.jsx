import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // 1. While authentication status is being verified via HTTP-only cookie
    if (loading) {
        return (
            <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center p-6 text-center font-mono selection:bg-[#fab818] selection:text-black">
                <div className="w-10 h-10 border-2 border-[#fab818] border-t-transparent animate-spin mb-4" />
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    VERIFYING BUILDER SESSION...
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                    Checking secure campus credentials
                </p>
            </div>
        );
    }

    // 2. If not logged in, redirect to /login and preserve destination
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Logged in, allow full access
    return children;
}

export default ProtectedRoute;

