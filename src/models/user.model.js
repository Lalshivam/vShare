import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; 
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type : String, //cloudinary url
        },
        coverImage: {
            type : String, //cloudinary url
        },
        watchHistory: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
)
//to hash the password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next(); 
})
//to compare the password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}
//to generate token
userSchema.methods.generateToken = function () {
    return jwt.sign(
        { 
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOPKEN_EXPIRE,
        }
    )
}
//to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { 
        _id: this._id,
       
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}
export const User = mongoose.model("User", userSchema);