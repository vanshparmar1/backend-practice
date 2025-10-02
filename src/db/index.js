import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB =async()=>{
    try {
       const ConnectionInstance=  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`Connected to DB !!!! DB host:${ConnectionInstance.connection.host}`)
        
    } catch (error) {
        console.error("Errrr:", error)
        process.exit(1)
        
    }
} 
export default connectDB