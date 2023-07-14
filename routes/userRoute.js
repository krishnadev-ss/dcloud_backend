const express = require("express");
const Router = express.Router();
const {registerUser, loginUser, logoutUser, getUser, updateUser} = require("../controllers/userController");
const {isAuthenticatedUser} = require("../middleware/auth");


Router.route("/register").post(registerUser);
Router.route("/login").post(loginUser);
Router.route("/logout").post(logoutUser);
Router.route("/profile").get(isAuthenticatedUser, getUser);
Router.route("/profile/update").put(isAuthenticatedUser, updateUser);



module.exports = Router;
