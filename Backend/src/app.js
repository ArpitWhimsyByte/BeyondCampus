import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
const app=express()

app.use(cors({
    origin: "http://localhost:5173",
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

export {app};