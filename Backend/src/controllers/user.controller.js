import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


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

const loginUser=asynchandler(async(req,res)=>{
    const{username,email,password}=req.body
    if(
        [username,email,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"Username and Email are required");
    }

    const user=await User.findOne({
        $or:[{username,email}
        ]
    })
    console.log("User found:", user ? "YES" : "NO");
    if (!user) {
        throw new ApiError(404,"User does not exist")
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    console.log("Password valid:", isPasswordValid);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid User Credentials");
    }

    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)
    console.log("ACCESS TOKEN VALUE:", accessToken);
console.log("TYPE:", typeof accessToken);
console.log("Access Token:", accessToken ? "Generated" : "Missing");
console.log("Refresh Token:", refreshToken ? "Generated" : "Missing");
    const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options={
        httpOnly:true,
        secure:false
    }
    return res.status(200).
    cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },"UserLoggedInSucces")
    )

    
})
const registerUser=asynchandler(async(req,res)=>{
    // get user details from frontend
    // check for validation - empty set
    //check if user already exists or not
    // check for images,check for avatar
    //upload them on cloudinary,avatar
    //create user object - create entry in database
    //remove the password and refresh token field from response
    // check user creation 
    //return response

    const{username,email,fullname,password}=req.body

    if (
        [username,email,fullname,password].some((field)=> field?.trim()==="")
    ) {
        throw new ApiError(400,"All fields are required")
    }

    const existedUser=await User.findOne({
        $or:[{username,email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with this email or username already exists")
    }

    const avatarLocalpath=req.files?.avatar[0]?.path
    const coverImageLocalpath=req.files?.coverImage[0]?.path
    console.log(avatarLocalpath);
    console.log(coverImageLocalpath);

    if(!avatarLocalpath){
        throw new ApiError(400,"Avatar is Required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalpath);
    console.log(avatar)
    const coverImage=await uploadOnCloudinary(coverImageLocalpath);
    console.log(coverImage)

    if(!avatar){
        throw new ApiError(500,'Error while uploading Images')
    }
    const user=await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
  })
  const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Successfully")
   )

})
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
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User Logged out"))
})



export {registerUser,loginUser,logoutUser}