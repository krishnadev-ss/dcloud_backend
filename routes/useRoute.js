const express = require("express");
const Router = express.Router();
const {registerUser} = require("../controllers/userController");


Router.route("/register").post(registerUser);

module.exports = Router;
