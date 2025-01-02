import { v2 as cloudinary } from 'cloudinary';//install cloudinary
import fs from 'fs' //inbuilt in nodejs for file-system handling 
import path from 'path'


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
    });
    
    const uploadOnCloudinary=async (localFilePath)=>{
      try{
        if(!localFilePath) {
          return null
        }

        const absolutePath = path.resolve(localFilePath);
        // console.log(process.env.CLOUDINARY_CLOUD_NAME)
        // console.log('Uploading file from absolute path:', absolutePath);
        

        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })

        //console.log('file is uploaded',response.url);
        //file has been uploaded successfully
        fs.unlinkSync(absolutePath);
        return response;

      }catch(error){
           console.log("Error occured while uploading on Cloudinary:",error)
           if (fs.existsSync(localFilePath)) {      //remove the locally saved temp file as upload operation failed
            await fs.promises.unlink(localFilePath);

           } 
           return null
           
      
      }
    }

    export {uploadOnCloudinary}
    