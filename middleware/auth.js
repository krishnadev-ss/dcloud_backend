const CatchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")

exports.isAuthenticatedUser = CatchAsyncError(async (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
        return next(new ErrorHandler("A token is required for authentication", 403))
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRETE);
        const user = await User.findById(decodedData.id);
        req.user = user
    } catch (err) {
        return next(new ErrorHandler("Invalid token", 401))
    }
    return next();
});
