import { upload } from "../middlewares/multer.middleware.js";
import { Post } from "../models/post.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPost = asynchandler(async (req, res) => {

    const { title, content } = req.body;

    if (
        [title, content].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Title and Content are Required");
    }
    const imageLocalPath=req.files?.image[0]?.path;
    const image= imageLocalPath
        ? await uploadOnCloudinary(imageLocalPath)
        : null;
    

    const post = await Post.create({
        title,
        content,
        image:image.url || "",
        author: req.user._id
    });
    return res.status(201).json(
        new ApiResponse(201,post,"Post Created Successfully")
    )
});

const getAllPosts=asynchandler(async(req,res)=>{
    const posts=await Post.find()
    .populate(
        "author",
        "username fullname avatar"
    ).sort({createdAt :-1});

    return res.status(200).json(
        new ApiResponse(200,posts,"Posts fetched successfully")
    )
})

const myPosts=asynchandler(async(req,res)=>{
    const myposts=await Post.find({author:req.user._id}).populate(
        "author",
        "username fullname avatar"
    ).sort({createdAt:-1})
console.log("REQ USER:", req.user);
console.log("USER ID:", req.user?._id);
    return res.status(200).json(
        new ApiResponse(200,myposts,"Your Posts Fetched successfully")
    )
})
const getSinglePost=asynchandler(async(req,res)=>{

    //req.params.postId ke through clicked post ka id from URL
    // database query on that 
    // check if the posts exists or not 
    //if not throw error
    // else return the response

    const ClickedPost=await Post.findById(req.params.postId).populate("author", "username fullname avatar");;
    console.log("Value : ",ClickedPost)
    if(!ClickedPost){
        throw new ApiError(404,"Posts does not exists")
    }

    res.status(200).json(
        new ApiResponse(200,ClickedPost,"Post Fetched Successfully")
    )
})

export{createPost,myPosts,getAllPosts,getSinglePost}