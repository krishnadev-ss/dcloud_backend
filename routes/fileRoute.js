const express = require("express");
const Router = express.Router();
const multer = require('multer');
const upload = multer();
const {uploadFile, getFile, getFiles, downloadFile} = require("../controllers/fileController")
const {isAuthenticatedUser} = require("../middleware/auth");

Router.route("/upload").post(isAuthenticatedUser, upload.single('file'), uploadFile);
Router.route("/file/:id").get(isAuthenticatedUser, getFile);
Router.route("/file/download/:cid").get( downloadFile);
Router.route("/files").get(isAuthenticatedUser, getFiles);


module.exports = Router;
