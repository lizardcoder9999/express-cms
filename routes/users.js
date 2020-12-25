const express = require("express");

const {
  renderRegistrationForm,
  registerUser,
} = require("../controllers/userController");

const router = express.Router();

router.route("/register").get(renderRegistrationForm).post(registerUser);

module.exports = router;
