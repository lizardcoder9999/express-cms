const User = require("../models/User");
const bcrypt = require("bcrypt");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const loginNotification = require("../utils/mail");
const { time } = require("console");

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
  username = req.body.username;
  requestIp = req.ip;
  userTime = new Date();

  await User.findOne({ username: username }, (err, obj) => {
    if (err) {
      throw err;
    } else {
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
    }
  });

  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })(req, res, next);
  ses = req.session;
  ses.username = username;
};
