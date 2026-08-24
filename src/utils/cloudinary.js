import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import "dotenv/config";

cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY , 
        api_secret: process.env.CLOUDINARY_API_SECRET 
        // Click 'View API Keys' above to copy your API secret
});
console.log({
    cloudName: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY ? "Present" : "Missing",
    apiSecret: process.env.CLOUDINARY_API_SECRET ? "Present" : "Missing"
});
const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file is uploaded on Cloudinary",response.url);
        fs.unlinkSync(localFilePath);
        return response;
        
    } catch (error) {
      console.log("CLOUDINARY ERROR:", error);
    
    if (localFilePath) {
        fs.unlinkSync(localFilePath);
    }

    return null;
    }
}

export {uploadOnCloudinary}