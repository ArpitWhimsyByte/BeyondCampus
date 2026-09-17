import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem("beyondcampus_user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    // Authoritative session verification against the Express backend
    // Works with both HTTP-only cookies and Authorization Bearer header
    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getCurrentUser();
            const user = response?.data || response;
            if (user && user._id) {
                setCurrentUser(user);
                localStorage.setItem("beyondcampus_user", JSON.stringify(user));
            } else {
                setCurrentUser(null);
                localStorage.removeItem("beyondcampus_user");
                localStorage.removeItem("beyondcampus_token");
            }
        } catch (error) {
            // 401 Unauthorized or 403 Forbidden indicates token/cookie is genuinely invalid or expired
            if (error.response?.status === 401 || error.response?.status === 403) {
                setCurrentUser(null);
                localStorage.removeItem("beyondcampus_user");
                localStorage.removeItem("beyondcampus_token");
            } else {
                // Network error / server spin-up: preserve cached user so UI doesn't flicker/lock out
                const saved = localStorage.getItem("beyondcampus_user");
                if (saved) {
                    try {
                        setCurrentUser(JSON.parse(saved));
                    } catch {
                        setCurrentUser(null);
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Automatically verify credentials on app mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Handle user login and update state
    const login = async (credentials) => {
        const response = await loginUser(credentials);
        const data = response?.data;
        const userData = data?.user || (data?._id ? data : null);
        const token = data?.accessToken;

        if (token) {
            localStorage.setItem("beyondcampus_token", token);
        }

        if (userData && userData._id) {
            setCurrentUser(userData);
            localStorage.setItem("beyondcampus_user", JSON.stringify(userData));
        } else {
            await checkAuth();
        }
        return response;
    };

    // Handle user logout and clear state
    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Error during server logout:", error);
        } finally {
            setCurrentUser(null);
            localStorage.removeItem("beyondcampus_user");
            localStorage.removeItem("beyondcampus_token");
        }
    };

    // Update current user state (e.g. after avatar / cover upload)
    const updateUser = (updatedData) => {
        setCurrentUser((prev) => {
            const next = prev ? { ...prev, ...updatedData } : updatedData;
            if (next) {
                localStorage.setItem("beyondcampus_user", JSON.stringify(next));
            }
            return next;
        });
    };

    const value = {
        currentUser,
        isAuthenticated: Boolean(currentUser),
        loading,
        login,
        logout,
        checkAuth,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;

