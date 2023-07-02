const app = require("./app");
const connectDB = require("./config/database");
const dotenv = require("dotenv");

process.on("uncaughtException", err => {
    console.log("Error: " + err.message);
    console.log("Shutting down the server due to uncaughtException");
    process.exit(1);
})


dotenv.config({path: "config/config.env"})
connectDB();



const server = app.listen(process.env.PORT, (req, res) => {
    console.log(`starting server on ${process.env.PORT}`)
});
