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

    return res.status(200).json(
        new ApiResponse(200,ClickedPost,"Post Fetched Successfully")
    )
})

const UpdatePost=asynchandler(async(req,res)=>{
    //Take Updated Content from Frontend
    // check for is the User logged in Or not through Verify Jwt
    // take posts Id from Url through req.params.postId
    // check if the posts exists or not
    // check is post.author === req.user._id
    // if yes then only update the post
    // find the post through database call and do a update query
    // save it and return the response

    const {content}=req.body
    const SelectedPost=await Post.findById(req.params.postId);
    if(!SelectedPost){
        throw new ApiError(404,"Posts does not exists")
    }
    if (!SelectedPost.author.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to edit this post")
}
    SelectedPost.content=content
     
    await SelectedPost.save()
    return res.status(200).json(
        new ApiResponse(200,SelectedPost,"Posts Updated Successfully")
    )
})

const deletePost=asynchandler(async(req,res)=>{
    // find the post through req.params.postId
    // check if the posts exist or not
    // is post.author===req.user._id logged user or not
    // if yes delete
    // if now throw error

    const PostToDelete=await Post.findById(req.params.postId)
    if(!PostToDelete){
        throw new ApiError(404,"Post does not exists")
    }
    if(!PostToDelete.author.equals(req.user._id)){
        throw new ApiError(403,"Invaild Authorization")
    }
    await PostToDelete.deleteOne()
    return res.status(200).json(
        new ApiResponse(200,{},"Post Deleted Successfully")
    )
})

export{createPost,myPosts,getAllPosts,getSinglePost,UpdatePost,deletePost}