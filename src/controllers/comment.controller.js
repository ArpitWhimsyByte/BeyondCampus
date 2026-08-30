import { Comment } from "../models/comment.models.js";
import { Post } from "../models/post.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const createComment=asynchandler(async(req,res)=>{
    // req.body data fetched from frontend
    // check if the comment is there or not
    //verify user logged in or not
    // get the postId from req.params from url 
    // create database entry to add comment 
    // return res 
    const {content}=req.body
    if (!content?.trim()) {
        throw new ApiError(400,"Comment is Empty")
    }
    const post=await Post.findById(req.params.postId)
    if (!post) {
        throw new ApiError(404,"Post Not found")
    }
    const comment=await Comment.create({
        content,
        createdBy:req.user._id,
        post:req.params.postId
    })

    return res.status(201).json(
        new ApiResponse(201,comment,"Comment created Successfully")
    )

})
const getAllComment=asynchandler(async(req,res)=>{
    // Through req.params.postId get the post
    // check if the post exist or not
    // Comment.find({post:postId})
    //populate createdBy
    //sort 
    //return comments
    const postIn=req.params.postId
    const existedPost=await Post.findById(postIn)
    if(!existedPost){
        throw new ApiError(404,"Post Not found")
    }
    const comments=await Comment.find({post:postIn}).populate("createdBy").sort({createdAt:-1})
    return res.status(200).json(
        new ApiResponse(200,comments,"All the comments ")
    )


})
const updateComment=asynchandler(async(req,res)=>{
    // take updated comment from frontend;
    // check if the comment exist or not 
    // check if the updated comment given is not empty 
    // verifyJwt to check the right user is updating comment or not
    const {content}=req.body
    if(!content){
        throw new ApiError(400,"Comment Cant be empty");
    }
    const originalComment=await Comment.findById(req.params.commentId);
    if(!originalComment){
        throw new ApiError(404,"comment does not exist");
    }
    if(!originalComment.createdBy.equals(req.user._id)){
        throw new ApiError(400,"Invalid Access")
    }
    originalComment.content=content
    await originalComment.save()

    return res.status(200).json(
        new ApiResponse(200,originalComment,"Comment Updated Successfully")
    )
})
const deleteComment=asynchandler(async(req,res)=>{
    // check if the posts exist or not 
    // check if the comment exist or not
    // take id and 

    const comment=await Comment.findById(req.params.commentId);
    if(!comment){
        throw new ApiError(404,"Comment Not Found")
    }
    await comment.deleteOne();
    return res.status(200).json(
        new ApiResponse(200,null,"Comment deleted successfully")
    )
})

export {createComment,getAllComment,deleteComment,updateComment}