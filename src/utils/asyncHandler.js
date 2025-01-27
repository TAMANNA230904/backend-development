const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }

//using try-catch
// const asyncHandler=()=>{}
// const asyncHandler=(fn)=>{}
// const asyncHandler=(fn)=>{()=>{}}

 //const asyncHandler=(fn)=>async (err,req,res,next)=>{
 //  try{
//   await fn(err,req,res,next)}
//   catch(err)=>{
//    res.status(err.code || 504).json({
//     sucess: false,
//     message:err.message
//   })
// }
//}   
