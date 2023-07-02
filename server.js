const app = require("./app");
const connectDB = require("./config/database");
const dotenv = require("dotenv");

dotenv.config({path: "config/config.env"})
connectDB();

const server = app.listen(process.env.PORT, (req, res) => {
    console.log(`starting server on ${process.env.PORT}`)
});
