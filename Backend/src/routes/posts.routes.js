import { Router } from "express";
import { createPost, deletePost, getAllPosts, getSinglePost, myPosts, UpdatePost } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/authmiddleware.js";

const router=Router()

router.route("/createpost").post(
    upload.fields([
        {
            name: "image",
            maxCount: 1
        }
    ]),
    verifyJWT,
    createPost
)

router.route("/getAllPosts").get(getAllPosts)

router.route("/my-posts").get(verifyJWT, myPosts)

router.route("/updatepost/:postId").patch(
    verifyJWT,
    UpdatePost
)
router.route("/deletePost/:postId").delete(
    verifyJWT,
    deletePost
);
router.route("/:postId").get(getSinglePost)
export default router
