import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getCurrentUser, loginUser, logoutUser, registerUser, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/authmiddleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
export default router