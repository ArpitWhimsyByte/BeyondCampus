import { app } from "./app.js";
import "dotenv/config";
// import { DB_NAME } from "./constants.js";
import connectDB from "./DB/index.js";

connectDB()
.then(
    app.listen(process.env.PORT || 7000,()=>{
        console.log(`Server is running at PORT : ${process.env.PORT}`)
    }

)
)
.catch((error)=>{
    console.log("Failed to Run the App")
})
