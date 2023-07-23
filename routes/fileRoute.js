const express = require("express");
const Router = express.Router();
const multer = require('multer');
const {uploadFile, getFile, getFiles, downloadFile, addToFavourite, getFavouriteFiles, deleteFile, searchFiles,
    getSharedFiles, shareFile, removeFromShare
} = require("../controllers/fileController")
const {isAuthenticatedUser} = require("../middleware/auth");

const upload = multer();

Router.route("/upload").post(isAuthenticatedUser, upload.single('file'), uploadFile);
Router.route("/file/:id").get(isAuthenticatedUser, getFile);
Router.route("/file/download/:cid").get( downloadFile);
Router.route("/files").get(isAuthenticatedUser, getFiles);
Router.route("/file/addtofavorite/:id").post(isAuthenticatedUser, addToFavourite);
Router.route("/files/favorites").get(isAuthenticatedUser, getFavouriteFiles);
Router.route("/file/delete/:id").delete(isAuthenticatedUser, deleteFile);
Router.route("/files/search").get(isAuthenticatedUser, searchFiles);
Router.route("/file/share/:id").post(isAuthenticatedUser, shareFile);
Router.route("/files/shared").get(isAuthenticatedUser, getSharedFiles);
Router.route("/file/shared/remove/:id").delete(isAuthenticatedUser, removeFromShare);



module.exports = Router;
