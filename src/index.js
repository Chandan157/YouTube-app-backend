import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
.then(() => {
    console.log(`Server is running at port: ${process.env.PORT}`);
})
.catch((err) => {
console.log("Mongo DB connection failed !!!", err);
});
