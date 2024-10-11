
import fs from "fs";  //fs = file system

import { v2 as cloudinary } from 'cloudinary';


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
  // upload video
  const uploadOnCloudinary = async (localfilePath) => {
    try {
        if(!localfilePath) return null
        // Upload video
        const response = await cloudinary.uploader.upload(localfilePath, {resource_type: "auto"})
        // console.log("file uploaded successfully",response.url);
        // Check if the file exists before deleting
        fs.unlinkSync(localfilePath); // delete the file
        return response;
    } catch (error) {
        fs.unlinkSync(localfilePath); // delete the file
        return null;
    }
  }

    export { uploadOnCloudinary };