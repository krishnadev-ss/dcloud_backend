const ipfs = require("../ipfsServer");
const mime = require('mime-types');
const CatchAsyncError = require("../middleware/catchAsyncError");
const File = require("../models/fileModel");

exports.uploadFile = CatchAsyncError( async (req, res, next) => {

    let addResult = await ipfs.add(req.file.buffer);
    const {cid} = addResult;
    const url = `https://gateway.ipfs.io/ipfs/${cid}`;

    const file = await File.create({
        name: req.file.originalname,
        cid,
        url,
        owner: req.user._id,
        type: req.file.mimetype,
        size: req.file.size
    })

    res.status(200).json({
        success: true,
        file
    })
})


exports.getFile = async (req, res, next) => {

    const cid = req.params.cid;
    const chunks = [];

    for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks); // convert array of buffers into single buffer
    const file = buffer.toString(); // convert buffer to string
    const mimeType = mime.lookup(file); // get file type
    // console.log(mimeType)

    res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename=${cid}`
    });

    res.end(buffer);
}

exports.getFiles = CatchAsyncError(async (req, res, next) => {
    const files = await File.find({owner: req.user._id});
    res.status(200).json({
        success: true,
        files
    })
})
