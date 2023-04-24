const express = require('express');
const multer = require('multer');
// const ipfsClient = require('ipfs-http-client');

const app = express();
app.use(express.json());

const ipfs = require("./ipfsServer")


async function addTextToIPFS(text) {
    const { cid } = await ipfs.add(text);
    const url = `https://gateway.ipfs.io/ipfs/${cid}`
    console.log(`Text added to IPFS with CID: ${cid}`);
    console.log(url)
    return cid;
}


async function getTextFromIPFS(cid) {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const text = buffer.toString();
    console.log(`Text retrieved from IPFS: ${text}`);
    return text;
}


const exampleText = 'Hello, world!';
addTextToIPFS(exampleText).then(cid => {
    getTextFromIPFS(cid);
});


module.exports = app;
