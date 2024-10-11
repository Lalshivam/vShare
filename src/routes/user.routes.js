import express from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";

const router = express.Router();

// router.post('/register',upload.fields([
//     {name: "avatar", maxCount: 1},
//     {name: "coverImages", maxCount: 3}
// ]),registerUser);
router.route("/register").post(upload.fields([
    {name: "avatar", maxCount: 1},
    {name: "coverImages", maxCount: 3}
]), registerUser);
export default router;   