const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode|| 500;
    err.message = err.message || "Internal Server Error";

    // if (err.name === 'ValidationError') {
    //     // Construct a response object with the error details
    //     const response = {
    //         status: 'error',
    //         message: 'Validation failed',
    //         errors: {}
    //     };
    //
    //     // Loop through each validation error and add it to the response object
    //     Object.keys(err.errors).forEach(field => {
    //         response.errors[field] = err.errors[field].message;
    //     });
    //
    //     // Send the response with the appropriate status code
    //     res.status(400).json(response);
    // }

    //wrong mongodb id error
    if(err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //mongoose duplicate key error
    if(err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // wrong jwt error
    if(err.message === "jsonWebTokenError") {
        const message = `json web token is invalid, try again`;
        err = new ErrorHandler(message, 400);
    }

    // jwt expire error
    if(err.message === "TokenExpiredError") {
        const message = `json web token is expired, try again`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        // error: err.stack  //this will tell the exact position where the error occure
        message: err.message
    })
}
