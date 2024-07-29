import dotenv from "dotenv"
dotenv.config({
    path:'./.env'
})

import { app } from "./app.js";
import mongoose from "mongoose";
import connectDB from "./db/index.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!",err);
})
















/*import express from "express"
const app=express()
//using IIFE to immediately execute the fxn for connecting to database
//as db is always far away ,we use async await
(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("error:-",error);
            throw error
        })

        app.listen(process.env.PORT,()=>[
            console.log(`App is lestening on port: ${process.env.PORT}`)
        ])
    } catch(error){
        console.log("ERROR",error)
        throw err
    }
})()
*/