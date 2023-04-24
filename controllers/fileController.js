const ipfs = require("../ipfsServer");
const mime = require('mime-types');

exports.uploadFile = async (req, res, next) => {

    // console.log(req.file)
    const { cid } = await ipfs.add(req.file.buffer);
    console.log(`${cid}`)
    const url = `https://gateway.ipfs.io/ipfs/${cid}`;
    console.log(url)

    res.status(200).json({
        success: true,
        cid,
        url
    })
};


exports.getFile = async (req, res, next) => {
    const cid = req.params.cid;
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const file = buffer.toString();
    const mimeType = mime.lookup(file);
    console.log(mimeType)
    res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename=${cid}`
    });
    res.end(buffer);
}