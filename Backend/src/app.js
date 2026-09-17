import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
const app=express()

const allowedOrigins = [
    "https://beyond-campus-nine.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            allowedOrigins.some((allowed) => origin.startsWith(allowed)) ||
            origin.endsWith(".vercel.app")
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js"
import postrouter from "./routes/posts.routes.js"
import commentrouter from "./routes/comment.routes.js"
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts",postrouter);
app.use("/api/v1/comments",commentrouter)

// Global error handling middleware to ensure clean JSON responses
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: err.errors || []
    });
});

export {app};