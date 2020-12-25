const { render } = require("ejs");
const express = require("express");

const {
  renderRegistrationForm,
  registerUser,
  renderLogin,
  loginUser,
} = require("../controllers/userController");

const router = express.Router();

router.route("/register").get(renderRegistrationForm).post(registerUser);

router.route("/login").get(renderLogin).post(loginUser);

module.exports = router;
