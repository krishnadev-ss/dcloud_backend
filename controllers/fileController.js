const ipfs = require("../ipfsServer");
const mime = require('mime-types');
const CatchAsyncError = require("../middleware/catchAsyncError")

exports.uploadFile = CatchAsyncError( async (req, res, next) => {
    console.log(req.file)
    const {cid} = await ipfs.add(req.file.buffer);
    const url = `https://gateway.ipfs.io/ipfs/${cid}`;
    console.log(url)

    res.status(200).json({
        success: true,
        cid: cid.toString(),
        url
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
