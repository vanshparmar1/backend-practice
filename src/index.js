import dotenv from "dotenv"
dotenv.config({
    path:"./env"
})
import connectDB from "./db/index.js";

connectDB().then(()=>{
    app.listen(process.env.PORT||8000   , ()=> 
    console.log(`Server is running on port ${process.env.PORT}`)
    )
 }).catch((err)=> 
console.log("MONGODB connection failed!!!", err))









// const app=express()
// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error)=>{
//             console.error("ERROR",error);
//             throw error
//         })
//         app.listen(process.env.PORT, ()=>{
//             console.log(`Server is running on port ${process.env.PORT}`);})
//     } catch (error) {
//         console.error("Errrr:", error)
//         throw error
//     }
// })()  