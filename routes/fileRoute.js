const express = require("express");
const Router = express.Router();

const multer = require('multer');
const upload = multer();

const {uploadFile, getFile} = require("../controllers/fileController")
const {isAuthenticatedUser} = require("../middleware/auth");

Router.route("/upload").post(isAuthenticatedUser, upload.single('file'), uploadFile);
Router.route("/file/:cid").get(isAuthenticatedUser, getFile);

module.exports = Router;
