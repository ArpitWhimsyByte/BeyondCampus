
import { app } from "./app.js";
import "dotenv/config";
import connectDB from "./DB/index.js";

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 7000, () => {
            console.log(
                `Server is running at PORT: ${process.env.PORT || 7000}`
            );
        });
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    });
