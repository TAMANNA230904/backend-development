const asynHandler=(reqHandler)=>{
    (req,res,next)=>{
        Promise.resolve(reqHandler(req,res,next)).
        catch((err)=>next(err))
    }
}


export {asyncHandler}









//using try-catch
// const asyncHandler=()=>{}
// const asyncHandler=(fn)=>{}
// const asyncHandler=(fn)=>{()=>{}}

 //const asyncHandler=(fn)=>async (err,req,res,next)=>{
 //  try{
//   await fn(err,req,res,next)}
//   catch(err)=>{
//   resizeBy.status(err.code || 504).json({
//     sucess: false,
//     message:err.message
//   })
// }
//}   
