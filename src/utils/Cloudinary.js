import { v2 as cloudinary } from 'cloudinary';//install cloudinary
import fs from 'fs' //inbuilt in nodejs for file-system handling 



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
    });

    const uploadOnCloudinary=async (localFilePath)=>{
      try{
        if(!localfilePath) return null
        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        //file has been uploaded successfully
        console.log('file is uploaded',response.url);
        return response;

      }catch(error){
           fs.unlinkSync(localFilePath) //remove the locally saved temp file as upload operation failed
           return null
      }
    }

    export {uploadOnCloudinary}
    