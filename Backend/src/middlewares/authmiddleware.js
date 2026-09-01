import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";
export const verifyJWT = asynchandler(async (req, res, next) => {
    try {
        console.log("Cookies:", req.cookies);
        console.log("Authorization:", req.header("Authorization"));

        const token = req.header("Authorization")?.replace("Bearer ", "");

        console.log("TOKEN:", token);

        if (!token) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        console.log(decodedToken);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        console.log("TOKEN:", token);
console.log("DECODED:", decodedToken);
console.log("USER:", user);
        req.user = user;

        next();

    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Invalid access token"
        );
    }
});