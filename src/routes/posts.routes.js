import { Router } from "express";
import { createPost, getAllPosts, getSinglePost, myPosts } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/authmiddleware.js";

const router=Router()

router.route("/createpost").post(upload.fields([
    {
        name:"image",
        maxCount:1
    }
]),verifyJWT,createPost)

router.route("/getAllPosts").get(getAllPosts)
router.route("/my-posts").get(verifyJWT,myPosts)
router.route("/:postId").get(getSinglePost)
export default router
