import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         console.log(`MONGODB connected successfully and DB HOST ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("FAILED TO CONNECT WITH DATABASE DUE TO ERROR : ",error)
        process.exit(1)
    }
}

export default connectDB