const express = require('express');
const ethers = require('ethers');
const bodyParser = require("body-parser");
const cookieParse = require("cookie-parser");
const errorMiddleWare = require("./middleware/error");


const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParse());

const fileRouter = require("./routes/fileRoute");
const userRouter = require("./routes/useRoute");

app.use("/api", fileRouter)
app.use("/api", userRouter)

app.use(errorMiddleWare);


// const url = "http://localhost:7545";
// const privateKey = "0x18165d960f3b359d97eaf307f6112d41406398371e74bb9689315c2c7f5b3539";
// const contractAddress = "0x626145163E5Ed31b48E19369A9568537FEf98E3A";
//
// const provider = new ethers.JsonRpcProvider(url);
// const wallet = new ethers.Wallet(privateKey, provider);
// const abi = require("./artifacts/contracts/Lock.sol/SimpleContract.json")
//
// const contract = new ethers.Contract(contractAddress, abi.abi, wallet);
//
//
// app.get("/api/lock", async (req, res) => {
//
//
//
//     res.json({
//         status: "success",
//     })
// })





// const ipfs = require("./ipfsServer")
// async function addTextToIPFS(text) {
//     const { cid } = await ipfs.add(text);
//     const url = `https://gateway.ipfs.io/ipfs/${cid}`
//     console.log(`Text added to IPFS with CID: ${cid}`);
//     console.log(url)
//     return cid;
// }
// async function getTextFromIPFS(cid) {
//     const chunks = [];
//     for await (const chunk of ipfs.cat(cid)) {
//         chunks.push(chunk);
//     }
//     const buffer = Buffer.concat(chunks);
//     const text = buffer.toString();
//     console.log(`Text retrieved from IPFS: ${text}`);
//     return text;
// }
// const exampleText = 'Hello, world!';
// addTextToIPFS(exampleText).then(cid => {
//     getTextFromIPFS(cid);
// });


module.exports = app;
