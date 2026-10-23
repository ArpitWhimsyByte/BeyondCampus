
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("Verifying your email...");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("Verification token is missing.");
            return;
        }

        const verify = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/v1/users/verify-email`,
                    { params: { token } }
                );

                setStatus(response.data.message || "Email verified successfully!");
                setSuccess(true);
            } catch (error) {
                setStatus(
                    error.response?.data?.message ||
                    "Verification failed. The link may be invalid or expired."
                );
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
            <h1 className="text-2xl font-bold">Email Verification</h1>
            <p>{status}</p>

            {success && (
                <Link to="/login" className="text-blue-600 underline">
                    Go to Login
                </Link>
            )}
        </div>
    );
}

export default VerifyEmail;
