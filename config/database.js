const mongoose = require("mongoose");


const connectDB = () => {
    mongoose.connect(process.env.DB_URI)
        .then((data) => {
            console.log("Connected to database with server " + data.connection.host);
        })
}

module.exports = connectDB
