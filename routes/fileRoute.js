const express = require("express");
const Router = express.Router();

const multer = require('multer');
const upload = multer();

const {uploadFile, getFile} = require("../controllers/fileController")

Router.route("/upload").post(upload.single('file'), uploadFile);
Router.route("/file/:cid").get( getFile);

module.exports = Router;