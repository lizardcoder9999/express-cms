const express = require("express");

const { renderRegistrationForm, registerUser } = require("../controllers/user");

const router = express.Router();

router.route("/register").get(renderRegistrationForm).post(registerUser);

module.exports = router;
