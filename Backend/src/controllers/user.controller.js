import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/emailService.js";


const verificationToken = crypto.randomBytes(32).toString("hex");

const verificationTokenHash = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
const generateAccessTokenAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
    
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
    
        return {accessToken,refreshToken}
    }
 catch (error) {
        throw new ApiError(500,"Something Went wrong while generating Access and Refresh Token")
}
}

const loginUser = asynchandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!password || (!username && !email)) {
        throw new ApiError(400, "Username or Email and password are required");
    }

    const searchQuery = [];
    if (username && username.trim()) {
        searchQuery.push({ username: username.trim().toLowerCase() });
    }
    if (email && email.trim()) {
        searchQuery.push({ email: email.trim().toLowerCase() });
    }

    const user = await User.findOne({
        $or: searchQuery
    });

    console.log("User found:", user ? "YES" : "NO");
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log("Password valid:", isPasswordValid);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials");
    }
    console.log("Email verified status:", user.isEmailVerified)
    console.log("User email:", user.email)
    if (!user.isEmailVerified) {
    throw new ApiError(
        403,
        "Please verify your email before logging in",
    );
}

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    console.log("ACCESS TOKEN VALUE:", accessToken);
    console.log("TYPE:", typeof accessToken);
    console.log("Access Token:", accessToken ? "Generated" : "Missing");
    console.log("Refresh Token:", refreshToken ? "Generated" : "Missing");

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User Logged In Successfully"
            )
        );
});

const registerUser = asynchandler(async (req, res) => {
    const { username, email, fullname, password } = req.body;

    if (
        [username, email, fullname, password].some(
            (field) => !field || (typeof field === "string" && field.trim() === "")
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existedUser = await User.findOne({
        $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    const avatarLocalpath = req.files?.avatar?.[0]?.path;
    const coverImageLocalpath = req.files?.coverImage?.[0]?.path;
    console.log("Avatar local path:", avatarLocalpath);
    console.log("CoverImage local path:", coverImageLocalpath);

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath);
    console.log("Avatar upload result:", avatar?.url);

    if (!avatar || !avatar.url) {
        throw new ApiError(500, "Error while uploading Avatar image");
    }

    let coverImage = null;
    if (coverImageLocalpath) {
        coverImage = await uploadOnCloudinary(coverImageLocalpath);
        console.log("Cover image upload result:", coverImage?.url);
    }
    // console.log(verificationToken);
    // console.log(emailVerificationTokenHash);
    const user = await User.create({
        fullname: fullname.trim(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: normalizedEmail,
        password,
        username: normalizedUsername,
        isEmailVerified: false,
emailVerificationTokenHash: verificationTokenHash,
emailVerificationExpires: verificationExpires
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ); 
    const verificationUrl =
    `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

await sendVerificationEmail({
    to: normalizedEmail,
    verificationUrl
});
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered Successfully")
        );
});

const verifyEmail = asynchandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    // Hash the token received from the email link
    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Find a user with a matching, unexpired token
    const user = await User.findOne({
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpires: { $gt: new Date() }
    });
    console.log("VERIFY EMAIL - matched user:", user.email);
console.log("VERIFY EMAIL - before save:", user.isEmailVerified);
console.log("VERIFY EMAIL - database:", user.db.name);
    if (!user) {
        throw new ApiError(
            400,
            "Invalid or expired verification link"
        );
    }
console.log("Verifying email for:", user.email);
console.log("Before update:", user.isEmailVerified);
    // Mark the email as verified
    user.isEmailVerified = true;

    // Invalidate the token so it cannot be reused
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();
    console.log("VERIFY EMAIL - after save:", user.isEmailVerified);
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Email verified successfully. You can now log in."
        )
    );
});

const logoutUser=asynchandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,{
      $set:{
        refreshToken:undefined
      }
    },{
      new:true
    }

  )
  const options={
    httpOnly:true,
    secure:true,
    sameSite: "none"
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User Logged out"))
})

const getCurrentUser = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const updateUserCoverImage = asynchandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path || req.files?.coverImage?.[0]?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(500, "Error while uploading cover image to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const updateUserAvatar = asynchandler(async (req, res) => {
  const avatarLocalPath = req.file?.path || req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(500, "Error while uploading avatar to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const getUserProfile = asynchandler(async (req, res) => {
  const { userId } = req.params;
  let user = null;

  if (mongoose.isValidObjectId(userId)) {
    user = await User.findById(userId).select("-password -refreshToken");
  }
  if (!user) {
    user = await User.findOne({ username: userId }).select("-password -refreshToken");
  }
  if (!user) {
    throw new ApiError(404, "Collegiate builder not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

export { registerUser, loginUser, logoutUser, getCurrentUser, updateUserCoverImage, updateUserAvatar, getUserProfile, verifyEmail }