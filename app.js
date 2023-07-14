const express = require('express');
const ethers = require('ethers');
const bodyParser = require("body-parser");
const cookieParse = require("cookie-parser");
const errorMiddleWare = require("./middleware/error");
const cors = require("cors");
const fileUpload = require("express-fileupload")

const app = express();

app.use(cors());
app.use(express.json()); // This is a middleware that allows us to accept json data in the body
app.use(cookieParse());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());


// ANSI escape sequences for colors and styles
const RESET = '\x1b[0m';
const LIGHT_GREEN = '\x1b[92m';
const YELLOW = '\x1b[33m';
const LIGHT_BLUE = '\x1b[94m';
const RED = '\x1b[31m';
const GRAYISH = '\x1b[37m';

// Middleware to log incoming requests with colored method and URL
app.use((req, res, next) => {
    const arrow = `${GRAYISH}==> `;
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const method = req.method;
    const url = req.url;

    let methodColor;
    switch (method) {
        case 'GET':
            methodColor = LIGHT_GREEN;
            break;
        case 'POST':
            methodColor = YELLOW;
            break;
        case 'DELETE':
            methodColor = RED;
            break;
        case 'PUT':
            methodColor = LIGHT_BLUE;
            break;
        default:
            methodColor = RESET;
    }

    console.log(`\n${arrow}[${timestamp}] Incoming request: ${methodColor}${method}${RESET} ${GRAYISH}${url}${RESET} from ${ip}`);
    // console.log(`${GRAYISH}Headers:${RESET}`, req.headers);
    // console.log(`${GRAYISH}Body:${RESET}`, req.body);

    res.on('finish', () => {
        const statusCode = res.statusCode;
        let statusColor;
        if (statusCode >= 300) {
            statusColor = RED;
        } else {
            statusColor = LIGHT_GREEN;
        }
        console.log(`${GRAYISH}[${timestamp}] Response status: ${statusColor}${statusCode}${RESET}`);
    });

    next();
});


const fileRouter = require("./routes/fileRoute");
const userRouter = require("./routes/userRoute");

app.use("/api", fileRouter)
app.use("/api/auth", userRouter)

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
