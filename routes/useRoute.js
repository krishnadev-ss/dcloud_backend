const express = require("express");
const Router = express.Router();
const {registerUser, userLogin} = require("../controllers/userController");


Router.route("/register").post(registerUser);
Router.route("/login").post(userLogin);


module.exports = Router;
