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


