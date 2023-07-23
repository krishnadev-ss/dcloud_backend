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
    url: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    owner: {
        type: mongoose.Schema.ObjectId,
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
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    isShared: {
        type: Boolean,
        default: false,
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    sharedWith: [
        {
            type: String,
            required: true,
            ref: "User"

        },
    ]
});

module.exports = mongoose.model("File", fileSchema);
