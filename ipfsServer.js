const ipfsClient = require('ipfs-http-client');

const ipfs = ipfsClient.create('http://localhost:5001');

// console.log(ipfs)


module.exports = ipfs;
