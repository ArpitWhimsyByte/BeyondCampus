
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async ({
    to,
    verificationUrl
}) => {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject: "Verify your BeyondCampus email",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome to BeyondCampus!</h2>
                <p>Please verify your email address to activate your account.</p>
                <a href="${verificationUrl}"
                   style="display:inline-block;padding:12px 20px;
                   background:#2563eb;color:white;text-decoration:none;
                   border-radius:6px;">
                    Verify Email
                </a>
                <p>If you did not create this account, you can ignore this email.</p>
            </div>
        `
    });

    if (error) {
        console.error("Resend email error:", error);
        throw new Error("Failed to send verification email");
    }

    return data;
};

export { sendVerificationEmail };
