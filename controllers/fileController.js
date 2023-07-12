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
    if (req.file.mimetype.split("/")[0] === "application")
        type = "document"
    else if (req.file.mimetype.split("/")[0] === "image/jpeg")
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
        size: req.file.size/1024
    })

    res.status(200).json({
        success: true,
        file
    })

    // const fileName = req.params.fileName
    //
    // req.on('data', chunk => {
    //     fs.appendFileSync(fileName, chunk); // append to a file on the disk
    // })
    //
    // res.send("df")

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

    condition.owner = req.user._id

    if (req.query.shared)
        condition.sharedWith = req.user._id;

    if (req.query.keyword) {
        condition.$or = [
            {name: {$regex: req.query.keyword, $options: 'i'}},
            {type: {$regex: req.query.keyword, $options: 'i'}}
        ]
    }

    const files = await File.find(condition);

    // sort files by date
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

    const storageInBytes = files.reduce((size, file) => file.size + size, 0)
    const storageInGB = storageInBytes / 1073741824;



    res.status(200).json({
        success: true,
        count,
        storageInBytes,
        storageInGB,
        files
    })
});


