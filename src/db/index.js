import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"


//const uri=process.env.MONGODB_URI

// `${process.env.MONGODB_URI}/${DB_NAME}`
const connectDB= async()=>{
   try{
    const connectionInstance= await mongoose.connect("mongodb+srv://tamannasheikh2304:UNqpJvDJhc8CmnF4@cluster0.hza3wbi.mongodb.net")
    console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    console.log(process.env.MONGODB_URI)
   }catch(error){
    console.log("MONGODB connection error",error);
    process.exit(1)
   }
}

export default connectDB

