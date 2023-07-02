const CatchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")

exports.isAuthenticatedUser = CatchAsyncError(async (req, res, next) => {

    if(!req.headers.authorization)
        return next(new ErrorHandler("no token found", 401));

    const token = req.headers.authorization.split(" ")[1]

    if(!token || token === "j:null")
        return next(new ErrorHandler("please login to access this resource", 401));

    const decodedData = jwt.verify(token, process.env.JWT_SECRETE);

    req.user = await User.findById(decodedData.id);

    next();
});
