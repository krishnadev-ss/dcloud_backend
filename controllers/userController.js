const User = require("../models/userModel");
const CatchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/sendToken");
const cloudinary = require('cloudinary').v2;


exports.registerUser = CatchAsyncError(async (req, res, next) => {

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

    if (!user)
        return next(new ErrorHandler("Invalid email or password", 401))

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched)
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


exports.updateUser = CatchAsyncError(async (req, res, next) => {

    let user = await User.findById(req.user._id);
    if (!user)
        return next(new ErrorHandler("user not found", 400))

    let newData;
    if (!req.body.avatar || req.body.avatar === "[object Object]") {
        newData = {
            email: req.body.email,
            name: req.body.name
        };
    } else {
        const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale"
        });

        newData = {
            email: req.body.email,
            name: req.body.name,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        };
    }
    user = await User.findByIdAndUpdate(req.user._id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    // console.log(user)

    res.status(200).json({
        success: true,
        user
    })
});
