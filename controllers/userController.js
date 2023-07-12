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

exports.loginUser = CatchAsyncError(async (req, res, next) => {

    const {email, password} = req.body;

    if (!email || !password)
        return next(new ErrorHandler("Please enter email & password", 400));

    const user = await User.findOne({email}).select("+password");

    if(!user)
        return next(new ErrorHandler("Invalid email or password", 401))

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched)
        return next(new ErrorHandler("Invalid email or password", 401))

    sendToken(user, 200, res);
});


exports.logoutUser = CatchAsyncError(async (req, res, next) => {
    req.user = null;
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
    })
});

exports.getUser = CatchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
        success: true,
        user
    })
});
