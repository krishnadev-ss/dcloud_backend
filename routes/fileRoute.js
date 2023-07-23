const express = require("express");
const Router = express.Router();
const multer = require('multer');
const {uploadFile, getFile, getFiles, downloadFile, addToFavourite, getFavouriteFiles} = require("../controllers/fileController")
const {isAuthenticatedUser} = require("../middleware/auth");

const upload = multer();

Router.route("/upload").post(isAuthenticatedUser, upload.single('file'), uploadFile);
Router.route("/file/:id").get(isAuthenticatedUser, getFile);
Router.route("/file/download/:cid").get( downloadFile);
Router.route("/files").get(isAuthenticatedUser, getFiles);
Router.route("/addtofavorite/:id").post(isAuthenticatedUser, addToFavourite);
Router.route("/files/favorites").get(isAuthenticatedUser, getFavouriteFiles);



module.exports = Router;
