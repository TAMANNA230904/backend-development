import cors from "cors"
import express from "express"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit:"10kb"
}))
app.use(express.urlencoded({extended:true,limit:"10kb"}))
app.use(express.static("public"))   //a public folder to keep image or favicon 
app.use(cookieParser())

//test
// tamannasheikh2304
//vaqBMJ5ujJ8PwxBU
//f937x2s.mongodb.net?retryWrites=true&w=majority&appName=Cluster0

//test-2
// tamannasheikh2304
// UNqpJvDJhc8CmnF4
// mongodb+srv://tamannasheikh2304:UNqpJvDJhc8CmnF4@cluster0.hza3wbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0


//routes import 
import userRouter from './routes/user.routes.js'

//router declaration
//here instead of using app.get ,we use middleware app.use because we are importing a route this will give control to the user.routes.js
app.use("/api/v1/users",userRouter)
//whenever a user want to register url will look like-http://localhost:8000/api/v1/users/register ---/register is suffixed from the userRouter 
export{app}