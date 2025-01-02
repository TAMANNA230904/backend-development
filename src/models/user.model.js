import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema=new Schema({
    username: {
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        index:true
    },
    email: {
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        
    },
    fullname: {
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar: {
        type:String,//cloudinary url
        required:true
    },
    coverImage: {
        type:String,//cloudinary url
    },
    watchHistory:[{
       type:Schema.Types.ObjectId,
       ref:"Video"
    }],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})


userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
// JWT is a bearer token
// access tokens are expired in a short span of time
userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id: this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
})
}

// refresh tokens are expired in a longer span of time
userSchema.methods.refreshAccessToken=function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
export const User=mongoose.model("User",userSchema)


// An access token is a digital asset, typically a JWT, facilitating seamless access to resources through 
// OAuth. These tokens act as keys that allow users to access 
// sensitive information without repeated login requests.


// Refresh tokens extend the lifespan of an access token. Typically, they’re issued alongside access tokens, 
// allowing additional access tokens to be granted when the live access token expires. They’re usually stored 
// securely on the authorization server itself.Refresh tokens work with access tokens to facilitate long-lived
// sessions without repeated logins.




