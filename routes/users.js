const { render } = require("ejs");
const express = require("express");

const {
  renderRegistrationForm,
  registerUser,
  renderLogin,
  loginUser,
  googleAuth,
  googleAuthCallback,
  logoutUser,
  renderForgotPage,
  ForgotPasswordToken,
  renderUpdateReset,
  passwordTokenReset,
} = require("../controllers/userController");

const router = express.Router();

router.route("/register").get(renderRegistrationForm).post(registerUser);

router.route("/login").get(renderLogin).post(loginUser);

router.route("/google").get(googleAuth);

router.route("/google/auth").get(googleAuthCallback);

router.route("/logout").get(logoutUser);

router
  .route("/password/reset/:token/:username")
  .get(renderUpdateReset)
  .post(passwordTokenReset);

router
  .route("/forgot-password")
  .get(renderForgotPage)
  .post(ForgotPasswordToken);

module.exports = router;
