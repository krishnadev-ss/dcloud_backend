const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "Please enter a name"],
        maxLength: [20, "Your name cannot exceed 20 characters"],
        minLength: [3, "Your name cannot be less than 4 characters"]
    },
    email: {
        type: String,
        require: [true, "Please enter a email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        require: [true, "Please enter a password"],
        minLength: [8, 'Your password must be longer than 8 characters'],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});


userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))
        return next();

    this.password = await bcrypt.hash(this.password, 10);
    return this.password;
});

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.getJWTToken = function () {
    return jwt.sign({id: this._id}, process.env.JWT_SECRETE, {
        expiresIn: process.env.JWT_EXPIRE
    });
}


module.exports = mongoose.model("User", userSchema);
