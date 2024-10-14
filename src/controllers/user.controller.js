import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found, Token can't be generated" );
        }
        // console.log(user);
        const accessToken = user.generateAccessToken();
        // console.log(accessToken);
        const refreshToken = user.generateRefreshToken();
        // console.log('Refresh Token:', refreshToken);
    
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        // console.log('Tokens generated and user saved successfully');

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Error in generating tokens");
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    //REQ body se data leaao
    //validate the data
    //check if the user exists
    //check for password
    //generate tokens access and refresh
    //send cookies with tokens
    //send response

    const {email, username, password} = req.body;
    if(!email && !username){
        throw new ApiError(400, "Email or username is required");
    }	
    const user = await User.findOne({
        $or : [{email},{username}]
    })
    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordMatched = await user.isPasswordCorrect(password);
    if(!isPasswordMatched){
        throw new ApiError(401, "Password is incorrect");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const logedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200,{
        user: logedInUser,
        accessToken,
        refreshToken
    }, "User logged in successfully"));

});

const logoutUser = asyncHandler(async (req, res) => {
    //clear the refresh token from db
    await User.findByIdAndUpdate
    (
        req.user._id, 
        {
            $set : {refreshToken: undefined}
        },
        {
            new: true,
        }
    );
    //clear the cookies
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
    
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    //get the refresh token from cookies
    //check if the refresh token exists
    //verify the refresh token
    //generate new access token
    //send response with new access token
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh token not found");
    }
   try {
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     const user = await  User.findById(decodedToken?._id);
     if(!user){
         throw new ApiError(401, "Invalid refresh token");
     }
     if(user?.refreshToken !== incomingRefreshToken){
         throw new ApiError(401, "refresh token is expired or used");
     }
    
 
     const options = {
         httpOnly: true,
         secure: true    ,
     }
 
     const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
 
     return res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(new ApiResponse(200, {accessToken, RefreshToken: newRefreshToken}, "Access token refreshed successfully"));
   } catch (error) {
       throw new ApiError(401, error?.message || "Invalid refresh token");
   }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
};

