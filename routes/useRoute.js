const express = require("express");
const Router = express.Router();
const {registerUser, loginUser, logoutUser} = require("../controllers/userController");


Router.route("/register").post(registerUser);
Router.route("/login").post(loginUser);
Router.route("/logout").get(logoutUser);



module.exports = Router;
