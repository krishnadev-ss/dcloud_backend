const ipfs = require("../ipfsServer");
const mime = require('mime-types');
const CatchAsyncError = require("../middleware/catchAsyncError");
const File = require("../models/fileModel");
const ErrorHandler = require("../utils/errorHandler");

exports.uploadFile = CatchAsyncError(async (req, res, next) => {

    if (!req.file)
        return next(new ErrorHandler("Please upload a file", 400));

    let addResult = await ipfs.add(req.file.buffer);
    const {cid} = addResult;
    const url = `https://gateway.ipfs.io/ipfs/${cid}`;
    let type;
    if (req.file.mimetype === "application/pdf" || req.file.mimetype === "application/msword" || req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        type = "document"
    else if (req.file.mimetype === "image/jpeg" || req.file.mimetype === "image/png" || req.file.mimetype === "image/gif" || req.file.mimetype === "image/tiff" || req.file.mimetype === "image/bmp" || req.file.mimetype === "image/webp" || req.file.mimetype === "image/vnd.microsoft.icon" || req.file.mimetype === "image/svg+xml" || req.file.mimetype === "image/x-icon" || req.file.mimetype === "image/vnd.djvu" || req.file.mimetype === "image/avif" || req.file.mimetype === "image/apng" || req.file.mimetype === "image/flif" || req.file.mimetype === "image/x-portable-pixmap" || req.file.mimetype === "image/x-portable-anymap" || req.file.mimetype === "image/x-portable-bitmap" || req.file.mimetype === "image/x-portable-graymap" || req.file.mimetype === "image/x-portable-arbitrarymap" || req.file.mimetype === "image/x-portable-bitmap" || req.file.mimetype === "image/x-portable-pixmap" || req.file.mimetype === "image/x-portable-anymap" || req.file.mimetype === "image/x-portable-graymap" || req.file.mimetype === "image/x-portable-arbitrarymap")
        type = "image"
    else if (req.file.mimetype === "video/mp4" || req.file.mimetype === "video/mpeg" || req.file.mimetype === "video/ogg" || req.file.mimetype === "video/quicktime" || req.file.mimetype === "video/webm" || req.file.mimetype === "video/x-ms-wmv" || req.file.mimetype === "video/x-flv" || req.file.mimetype === "video/x-msvideo" || req.file.mimetype === "video/3gpp" || req.file.mimetype === "video/3gpp2" || req.file.mimetype === "video/x-matroska" || req.file.mimetype === "video/x-m4v" || req.file.mimetype === "video/avi" || req.file.mimetype === "video/x-ms-asf" || req.file.mimetype === "video/x-mpegURL" || req.file.mimetype === "video/MP2T" || req.file.mimetype === "video/x-msvideo" || req.file.mimetype === "video/x-flv" || req.file.mimetype === "video/x-ms-wmv" || req.file.mimetype === "video/x-ms-asf" || req.file.mimetype === "video/x-mpegURL" || req.file.mimetype === "video/MP2T" || req.file.mimetype === "video/x-m4v" || req.file.mimetype === "video/avi" || req.file.mimetype === "video/x-matroska")
        type = "video"
    else
        type = "other"

    const file = await File.create({
        name: req.file.originalname,
        cid,
        url,
        owner: req.user._id,
        type,
        size: req.file.size
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

    const condition = {}

    if (req.query.type)
        condition.type = req.query.type;

    if (req.query.shared)
        condition.sharedWith = req.user._id;

    if (req.query.keyword) {
        condition.$or = [
            {name: { $regex: req.query.keyword, $options: 'i' }},
            {type: {$regex: req.query.keyword ,$options: 'i'}}
        ]
    }

    const files = await File.find(condition);

    res.status(200).json({
        success: true,
        count: files.length,
        files
    })
});


