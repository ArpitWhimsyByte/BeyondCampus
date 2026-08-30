import { Router } from "express";
import { verifyJWT } from "../middlewares/authmiddleware.js";
import { createComment, deleteComment, getAllComment, updateComment } from "../controllers/comment.controller.js";

const router=Router()

router.route("/:postId").post(verifyJWT, createComment)
router.route("/:postId").get(getAllComment)
router.route("/:commentId").delete(verifyJWT,deleteComment)
router.route("/:commentId").patch(verifyJWT,updateComment)

export default router