import express from "express";
import {
     loginUser,
     logoutUser,
     registerUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.post('/register',upload.fields([
//     {name: "avatar", maxCount: 1},
//     {name: "coverImages", maxCount: 3}
// ]),registerUser);
router.route("/register").post(upload.fields([
    {name: "avatar", maxCount: 1},
    {name: "coverImage", maxCount: 3}
]), registerUser);
router.route("/login").post(loginUser);
//secure routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails); 
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/update-cover-image").patch(verifyJWT,upload.array("coverImage"),updateUserCoverImage);
router.route("/c/:username").get(verifyJWT,getUserChannelProfile);   
router.route("/history").get(verifyJWT,getWatchHistory);
export default router;   