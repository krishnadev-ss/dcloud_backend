const User = require("../models/userModel");
const CatchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/sendToken");


exports.registerUser = CatchAsyncError (async (req, res, next) => {

    const {name, email, password} = req.body;

    const user = await User.create({
        name,
        email,
        password
    });

    sendToken(user, 201, res);

});
