import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Authoritative session verification against the Express backend
    // Checks HTTP-only cookies sent automatically by Axios (withCredentials: true)
    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getCurrentUser();
            const user = response?.data || response;
            if (user && user._id) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        } catch (error) {
            // 401 Unauthorized or network failure implies no active session
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Automatically verify HTTP-only cookie on app mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Handle user login and update state
    const login = async (credentials) => {
        const response = await loginUser(credentials);
        const userData = response?.data?.user || response?.data;
        if (userData && userData._id) {
            setCurrentUser(userData);
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
        }
    };

    // Update current user state (e.g. after avatar / cover upload)
    const updateUser = (updatedData) => {
        setCurrentUser((prev) => {
            if (!prev) return updatedData;
            return { ...prev, ...updatedData };
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

