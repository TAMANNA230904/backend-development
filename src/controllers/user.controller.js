import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import  {uploadOnCloudinary} from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from 'fs'
import path from 'path'
import jwt from "jsonwebtoken";

const generateAccessandRefreshTokens=async(userId)=>{
    try{
             const user=await User.findById(userId)
             if(!user)
             throw new ApiError(400,"user not found!!")
            
             const accessToken=user.generateAccessToken()
             const refreshToken=user.refreshAccessToken()
             
             //add this refresh token in db
             user.refreshToken=refreshToken
             await user.save({ validateBeforeSave:false })

             return {accessToken,refreshToken}

    }catch(error){
      throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend

    //if data is coming from form or json
    const {fullname,email,username,password}=req.body
    //console.log("email:",email);
    //validation of credentials
    if([fullname, email, username, password].some((field)=>field?.trim()==="")){
        {
           throw new ApiError(400,"All fields are required")
        }
       }
    //check if user already exists
      const existedUser= await User.findOne({
        $or:[{username},{email}]
      })
      if(existedUser){
        throw new ApiError(409,"Username or Email Already Exists")
      }

    //check for images ,check for avatar
    //multer middleware gives access to files in req

    const avatarLocalPath=req.files?.avatar[0]?.path;
    //const coverImageLocalPath=req.files?.coverImage?.[0]?.path;

    // console.log("Avatar path:",avatarLocalPath)
    // console.log("coverImage path:",coverImageLocalPath)

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is Required")
    }

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }
    //checking if path exists
    // const avatarFileExists = fs.existsSync(avatarLocalPath);
    // const coverImageFileExists = fs.existsSync(coverImageLocalPath);
    
    //upload them to cloudinary , avatar
     const avatar=await uploadOnCloudinary(avatarLocalPath)
     const coverImage=await uploadOnCloudinary(coverImageLocalPath) 

    // Just use dummy URLs or empty strings if you are testing locally
    // const avatarUrl = avatarFileExists ? "http://localhost:3000/uploads/avatar.jpg" : "";
    // const coverImageUrl = coverImageFileExists ? "http://localhost:3000/uploads/coverImage.jpg" : "";

     if(!avatar){
        throw new ApiError(400,"Avatar is Required")
     }
//coverImage?.url || ""
    //create user object -create entry in db
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    //check if user is created
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
      
    //once user is created remove password and refresh token field from response as it is confidential
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    
    
    // if created return response else send error
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )

})

const loginUser=asyncHandler(async(req,res)=>{
      //req body->data
      const{email,username,password}=req.body
      console.log(email)
      if(!username && !email ){
        throw new ApiError(400,"Email or Username not found")
      }

      //username or email login ,find the user
      const user=await User.findOne({
        $or:[{username},{email}]
      })

      if(!user){
        throw new ApiError(404,"User does not exist")
      }
       //password check
      const isPasswordValid=await user.isPasswordCorrect(password)
      if(!isPasswordValid){
        throw new ApiError(401,"Password Incorrect")
      }
      
      
      //generate access and refresh token 
      const {accessToken,refreshToken}=await generateAccessandRefreshTokens(user._id)

      const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

      // send the tokens as cookies
      // cookie has options which does not allow frontend to modify them 
       const options={
        httpOnly:true,
        secure:true,
        
       }
      

     //we return a response having status ,no. of cookies as key-value with options
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,
      {
      user:loggedInUser,accessToken,refreshToken
      },
      "User logged In successfully"))
})

const logoutUser=asyncHandler(async(req,res)=>{
  
  await User.findByIdAndUpdate(
    req.user._id,
    {
        $unset: {
            refreshToken: 1 // this removes the field from document
        }
    },
    {
        new: true
    }
)

const options = {
    httpOnly: true,
    secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken= asyncHandler(async(req,re)=>{
 const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
 if(!incomingRefreshToken){
  throw new ApiError(401,"Unauthorized request")
 }

 try {
  const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  const user=User.findById(decodedToken?._id)
  if(!user){
   throw new ApiError(401,"Invalid refresh token")
  }
  if(incomingRefreshToken!==user?.refreshToken){
   throw new ApiError(401,"Rfresh token expired or used")
  }
  const options={
   httpOnly:true,
   secure:true
  }
  const {accessToken,newRefreshToken}=await generateAccessandRefreshTokens(user._id)
 
   return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken,options)
  .json( 
   new ApiResponse(
     200,
     {accessToken,refreshToken:newRefreshToken},
     "Access token refreshed successfully"
   )
  )
 
 } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
 }
})


const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body
  const user=await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid password")
  }
  
user.password=newPassword
  await user.save({validateBeforeSave:false})
  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password Changed successfully"))
})


const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullName,email}=req.body
  if(!fullName || !email){
    throw new ApiError(400,"Detailes required")
  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email:email
      }
    },
    {new:true}
  ).select("-password")
  return res.status(200)
  .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
   const avatarLocalPath=req.file?.path
   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
   }

   const avatar=await uploadOnCloudinary(avatarLocalPath)
   if(!avatar.url){
    throw new ApiError(400,"Error while uploading on avatar")
   }
   const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true}
   ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"CoverImage updated")
  )
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file?.path
  if(!coverImageLocalPath){
   throw new ApiError(400,"cover image file is missing")
  }

  const coverImage=await uploadOnCloudinary(coverImageLocalPath)
  if(!coverImage.url){
   throw new ApiError(400,"Error while uploading on avatar")
  }
  const user=await User.findByIdAndUpdate(
   req.user?._id,
   {
     $set:{
       coverImage:coverImage.url
     }
   },
   {new:true}
  ).select("-password")
  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"CoverImage updated")
  )
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
           const {username} =req.params  //instead of body
           if(!username?.trim()){
                   throw new ApiError(400,"Username is missing")
           }

           // writing aggregation pipelines
           const channel=await User.aggregate([
            {
              $match:{
                username: username?.toLowerCase()
              }
            },
              {
                 $lookup: {
                  from:"subscriptions",
                  localField:"_id",
                  foreignField:"channel",
                  as:"subscribers"
                 }
              },
              {
                $lookup:{
                  from:"subscriptions",
                  localField:"_id",
                  foreignField:"subscriber",
                  as:"subscribedTo"
                }
              },
              {
                $addFields:{
                    subscribersCount:{
                      $size:"$subscribers"
                    },
                    channelSubscibedToCount:{
                      $size:"$subscribedTo"
                    },
                    isSubscribed:{
                      $cond:{
                        if: {$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                      }
                    }
                }
              },{
                $project:{
                  fullName:1,
                  username:1,
                  subscribersCount:1,
                  channelSubscibedToCount:1,
                  avatar:1,
                  coverImage:1,
                  email:1
                }
              }
           ])


           if(!channel?.length){
            throw new ApiError(404,"channel does not exist")
           }

           return res
           .status(200)
           .json(
            new ApiResponse(200,channel[0],"User channel fetched successfully")
           )
})

const getWacthHistory=asyncHandler(async(req,res)=>{
   //  req.user._id   //we get a string id and mongoose converts it to a mongoDB id  
      const user=await User.aggregate([
        {
          $match:{
            _id:new mongoose.Types.ObjectId(req.user._id) // here we have to convert it into mongodb id
          }
        },{
          $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
              {
                $lookup:{
                   from:"users",
                   localField:"owner",
                   foreignField:"_id",
                   as:"owner",
                   pipeline:[
                    {
                      $project:{
                        fullName:1,
                        username:1,
                        avatar:1
                      }
                    },
    // as we get array from lookup pipelines we further add pipeline to take out the first value from that array
                    {
                       $addFields:{
                        owner:{
                          $first:"$owner"
                        }
                       }
                    }
                   ]
                }
              }
            ]
          }
        }
      ])

      return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user[0].watchHistory,
          "Watch history fetched successfully"
        )
      )
})




export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWacthHistory
};

 