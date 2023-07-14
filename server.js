const app = require("./app");
const connectDB = require("./config/database");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");

process.on("uncaughtException", err => {
    console.log("Error: " + err.message);
    console.log("Shutting down the server due to uncaughtException");
    process.exit(1);
})


dotenv.config({path: "config/config.env"})
connectDB();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});



const server = app.listen(process.env.PORT, (req, res) => {
    console.log(`starting server on ${process.env.PORT}`)
});
