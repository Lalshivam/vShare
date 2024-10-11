import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({message: "Good Shivam"})
    //get request from user to register
    //validate the data
    //check if the user already exists : email,username if unique
    // check for images and avatar
    //store the data in db cloudinary(images)
    //create user object (stored in atlas mongodb)
    //remove password and refresh token field from the response
    //check for user creation
    //return reposnse else send error

    const {fullName , email , username , password } = req.body

    if(
        [fullName, email, username, password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })
    
    if(existedUser){
        throw new ApiError(409, "User with this email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Please upload avatar image");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : { url: "" };
    
    if(!avatar){
        throw new ApiError(500, "Error in uploading avatar image");
    }

    const newUser = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage: coverImage.url || "",
        email,
        username: username.toLowerCase(),
        password,
    });
    
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Error in registering user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));

});

export {
    registerUser,
};

