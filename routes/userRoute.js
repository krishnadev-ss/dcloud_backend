const express = require("express");
const Router = express.Router();
const {registerUser, loginUser, logoutUser, getUser} = require("../controllers/userController");
const {isAuthenticatedUser} = require("../middleware/auth");


Router.route("/register").post(registerUser);
Router.route("/login").post(loginUser);
Router.route("/logout").post(logoutUser);
Router.route("/profile").get(isAuthenticatedUser, getUser);



module.exports = Router;
