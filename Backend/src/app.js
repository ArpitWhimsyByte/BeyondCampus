import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
const app=express()

app.use(cors({
    origin: "https://beyond-campus-nine.vercel.app",
    credentials: true
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