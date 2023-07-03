const mongoose = require("mongoose");
const User = require("./userModel")


const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cid: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    owner: {
        type: String,
        required: true,
        ref: "User"
    },
    size: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        required: true,
    },
    isShared: {
        type: Boolean,
        required: true,
    },
    sharedWith: [
        {
            type: String,
            required: true,
            ref: "User"

        },
    ]
});
