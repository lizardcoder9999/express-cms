const User = require("../models/User");
const bcrypt = require("bcrypt");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const { loginNotification, passwordResetEmail } = require("../utils/mail");
const { time } = require("console");
const cookieSession = require("cookie-session");
require("../config/passport-google");
const Token = require("../models/Token");
const { token } = require("morgan");

//@desc Register user
//@route GET /register
//@access Public

exports.renderRegistrationForm = async (req, res, next) => {
  await res.render("register");
};

//@desc Register user
//@route POST /register
//@access Public

exports.registerUser = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.password;
  const ip = req.ip;

  let newUser = await new User({
    username: username,
    password: password,
    email: email,
    lastIp: ip,
    role: "user",
  });
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        console.log(err);
      }
      newUser.password = hash;
      newUser.save((err) => {
        if (err) {
          throw err;
        } else {
          res.redirect("login");
        }
      });
    });
  });
};

//@desc Login user
//@route GET /login
//@access Public

exports.renderLogin = async (req, res, next) => {
  await res.render("login");
};

//@desc Login user
//@route POST /login
//@access Public

exports.loginUser = async (req, res, next) => {
  const username = req.body.username;
  const requestIp = req.ip;
  const userTime = new Date();

  await User.findOne({ username: username }, (err, obj) => {
    if (err) {
      throw err;
    } else {
      try {
        if (requestIp != obj.lastIp) {
          loginNotification(username, requestIp, userTime, obj.email);
          User.updateOne(
            { username: username },
            { $set: { lastIp: requestIp } },
            (err, obj) => {
              console.log(err);
              console.log(obj);
            }
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
  });

  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })(req, res, next);
  ses = req.session;
  ses.username = username;
};

//@desc Login user via oauth
//@route GET /google
//@access Public

exports.googleAuth = async (req, res, next) => {
  await passport.authenticate("google", { scope: ["profile", "email"] });
};

//@desc Google oauth callback url
//@route GET /google/auth
//@access Public

exports.googleAuthCallback = async (req, res, next) => {
  await passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/home");
    };
};

//@desc Logout user and remove sessions
//@route GET /logout
//@access Public

exports.logoutUser = (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/login");
};

//@desc Forgot password page
//@route GET /forgot-password
//@access Public

exports.renderForgotPage = async (req, res) => {
  await res.render("forgotpassword");
};

/* 
  @desc
  Creates and hashes token which expires in 10 minutes and sends password reset email
  which will bring the user to the new password route.
*/
//@route POST /forgot-password
//@access Public

exports.ForgotPasswordToken = async (req, res) => {
  username = req.body.username;
  const add_minutes = function (dt, minutes) {
    return new Date(dt.getTime() + minutes * 60000);
  };
  const time = add_minutes(new Date(), 10).toString();
  const decimalTime = time.replaceAll(":", "").substr("16", "6");
  const tokenExp = decimalTime;
  const token = Math.random()
    .toString(24)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);
  hashed_token = bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(token, salt, (err, hash) => {
      if (err) {
        console.log(err);
      }
    });
  });

  await User.findOne({ username: username }, (err, obj) => {
    const userEmail = obj.email;
  });

  let newToken = new Token({
    tokenUser: username,
    tokenVal: hashed_token,
    tokenExpiration: tokenExp,
  });

  const resetLink = `https://localhost:5000/password/reset/${token}/${username}`;
  newToken.save();
  passwordResetEmail(username, userEmail, resetLink);
  res.redirect("/login");
};

// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(newUser.password, salt, (err, hash) => {
//     if (err) {
//       console.log(err);
//     }

// let newUser = await new User({
//   username: username,
//   password: password,
//   email: email,
//   lastIp: ip,
//   role: "user",
// });
