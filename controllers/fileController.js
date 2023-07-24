const ipfs = require("../ipfsServer");
const mime = require('mime-types');
const CatchAsyncError = require("../middleware/catchAsyncError");
const File = require("../models/fileModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");

exports.uploadFile = CatchAsyncError(async (req, res, next) => {

    if (!req.file)
        return next(new ErrorHandler("Please upload a file", 400));

    let addResult = await ipfs.add(req.file.buffer);

    const {cid} = addResult;

    const isFileExists = await File.findOne({owner: req.user._id, cid});
    console.log(isFileExists)
    if (isFileExists)
        return next(new ErrorHandler("File already exists", 400));


    const url = `https://gateway.ipfs.io/ipfs/${cid}?filename=${encodeURIComponent(req.file.originalname)}`;

    let type;
    if (req.file.mimetype.split("/")[0] === "application")
        type = "document"
    else if (req.file.mimetype.split("/")[0] === "image")
        type = "image"
    else if (req.file.mimetype.split("/")[0] === "video")
        type = "video"
    else if (req.file.mimetype.split("/")[0] === "audio")
        type = "audio"
    else
        type = "other"

    const file = await File.create({
        name: req.file.originalname,
        cid,
        url,
        owner: req.user._id,
        type,
        size: req.file.size / (1024 * 1024)
    })

    res.status(200).json({
        success: true,
        file
    })
})


exports.getFile = async (req, res, next) => {

    const id = req.params.id;

    const owner = await File.findById(id).select("owner");

    if (!owner)
        return next(new ErrorHandler("File not found", 404));

    const sharedWith = await File.findOne({id}).select("sharedWith");


    if (!owner.owner.toString() === req.user._id.toString()) {
        if (sharedWith) {
            if (!sharedWith.sharedWith.includes(req.user._id.toString())) {
                return next(new ErrorHandler("You are not authorized to access this file", 401))
            }

        }
        return next(new ErrorHandler("You are not authorized to access this file", 401))
    }

    const file = await File.findById(id);

    res.status(200).json({
        success: true,
        file
    });
}

exports.downloadFile = async (req, res, next) => {

    console.log(req.params)

    const id = req.params.cid;

    const file = await File.findOne({cid: id});

    const chunks = [];

    for await (const chunk of ipfs.cat(file.cid)) {
        chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks); // convert array of buffers into single buffer
    const file_type = buffer.toString(); // convert buffer to string
    const mimeType = mime.lookup(file_type); // get file type
    // console.log(mimeType)

    res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename=${id}`
    });

    res.end(buffer);
}


exports.getFiles = CatchAsyncError(async (req, res, next) => {

    const files = await File.find({owner: req.user._id})

    // sort files by date
    files.sort((a, b) => {
        return b.createdAt - a.createdAt;
    })

    const images = {
        total: files.filter(file => file.type === "image").length,
        files: files.filter(file => file.type === "image")
    }

    const videos = {
        total: files.filter(file => file.type === "video").length,
        files: files.filter(file => file.type === "video")
    }

    const audios = {
        total: files.filter(file => file.type === "audio").length,
        files: files.filter(file => file.type === "audio")
    }

    const documents = {
        total: files.filter(file => file.type === "document").length,
        files: files.filter(file => file.type === "document")
    }

    const others = {
        total: files.filter(file => file.type === "other").length,
        files: files.filter(file => file.type === "other")
    }


    const count = {
        total: files.length,
        document: files.filter(file => file.type === "document").length,
        image: files.filter(file => file.type === "image").length,
        video: files.filter(file => file.type === "video").length,
        audio: files.filter(file => file.type === "audio").length,
        other: files.filter(file => file.type === "other").length,
    }

    const storageInMB = files.reduce((acc, file) => acc + file.size, 0)

    const storageInGB = storageInMB / 1024;

    res.status(200).json({
        success: true,
        count,
        storageInMB,
        storageInGB,
        images,
        videos,
        audios,
        documents,
        others,
        files
    })
});


exports.shareFile = CatchAsyncError(async (req, res, next) => {

    const id = req.params.id;
    const email = req.body.shareEmail;


    if (email === req.user.email)
        return next(new ErrorHandler("You cannot share file with yourself", 400))

    const sharedUser = await User.findOne({email})

    if (!sharedUser)
        return next(new ErrorHandler("User not found", 404))

    const owner = await File.findById(id).select("owner");

    console.log(owner)

    if (!owner)
        return next(new ErrorHandler("File not found", 404));

    if (owner.owner.toString() !== req.user._id.toString())
        return next(new ErrorHandler("You are not authorized to share this file", 401))

    const file = await File.findById(id);

    file.sharedWith.map(user => {
        if (user.sharedUser.toString() === sharedUser._id.toString())
            return next(new ErrorHandler("File already shared with this user", 400))
    })

    file.sharedWith.push({sharedUser: sharedUser._id});

    await file.save();

    res.status(200).json({
        success: true,
        file
    })
})

exports.getSharedFiles = CatchAsyncError(async (req, res, next) => {

    const files = await File.find({"sharedWith.sharedUser": req.user._id})

    if (!files)
        return next(new ErrorHandler("No shared files found", 404))

    const count = {
        total: files.length,
        document: files.filter(file => file.type === "document").length,
        image: files.filter(file => file.type === "image").length,
        video: files.filter(file => file.type === "video").length,
        audio: files.filter(file => file.type === "audio").length,
        other: files.filter(file => file.type === "other").length,
    }

    res.status(200).json({
        success: true,
        count,
        files
    })
});

exports.removeFromShare = CatchAsyncError(async (req, res, next) => {

    const id = req.params.id;

    const file = await File.findById(id);

    if (!file)
        return next(new ErrorHandler("No shared files found", 404))

    await File.updateOne(
        {_id: id},
        {$pull: {sharedWith: {sharedUser: req.user._id}}})

    res.status(200).json({
        success: true,
    });
})


exports.deleteFile = CatchAsyncError(async (req, res, next) => {

    const id = req.params.id;

    const owner = await File.findById(id).select("owner");

    if (!owner)
        return next(new ErrorHandler("File not found", 404));

    if (!owner.owner.toString() === req.user._id.toString())
        return next(new ErrorHandler("You are not authorized to delete this file", 401))

    const deleteFile = await File.findByIdAndDelete(id);
    console.log(deleteFile)
    ipfs.pin.rm(deleteFile.cid, (err, pinset) => {
        if (err) {
            res.status(400).json({
                success: false,
                message: "Error deleting file"
            })
        }
    })

    res.status(200).json({
        success: true,
        message: "File deleted successfully"
    })
})


exports.addToFavourite = CatchAsyncError(async (req, res, next) => {

    const id = req.params.id;

    const owner = await File.findById(id).select("owner");

    if (!owner)
        return next(new ErrorHandler("File not found", 404));

    if (!owner.owner.toString() === req.user._id.toString())
        return next(new ErrorHandler("You are not authorized to add this file to favourite", 401))

    const file = await File.findById(id);

    file.isFavorite = !file.isFavorite;

    await file.save();

    res.status(200).json({
        success: true,
        message: `${file.isFavorite ? "Added to" : "Removed from"} favourite successfully`
    })
});


exports.getFavouriteFiles = CatchAsyncError(async (req, res, next) => {

    const files = await File.find({isFavorite: true, owner: req.user._id});

    if (!files)
        return next(new ErrorHandler("No favourite files found", 404))

    const count = {
        total: files.length,
        document: files.filter(file => file.type === "document").length,
        image: files.filter(file => file.type === "image").length,
        video: files.filter(file => file.type === "video").length,
        audio: files.filter(file => file.type === "audio").length,
        other: files.filter(file => file.type === "other").length,
    }

    res.status(200).json({
        success: true,
        count,
        files
    })
});

exports.searchFiles = CatchAsyncError(async (req, res, next) => {

    const condition = {}

    if (req.query.type)
        condition.type = req.query.type;

    condition.owner = req.user._id

    if (req.query.keyword) {
        condition.$or = [
            {name: {$regex: req.query.keyword, $options: 'i'}},
            {type: {$regex: req.query.keyword, $options: 'i'}}
        ]
    }

    const files = await File.find(condition);

    files.sort((a, b) => {
        return b.createdAt - a.createdAt;
    })

    const count = {
        total: files.length,
        document: files.filter(file => file.type === "document").length,
        image: files.filter(file => file.type === "image").length,
        video: files.filter(file => file.type === "video").length,
        audio: files.filter(file => file.type === "audio").length,
        other: files.filter(file => file.type === "other").length,
    }

    res.status(200).json({
        success: true,
        count,
        files
    })
})

