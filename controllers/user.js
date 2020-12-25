const User = require("../models/User");
const bcrypt = require("bcrypt");
const express = require("express");

//@desc Register user
//@route GET /register
//@access Public

exports.renderRegistrationForm = async (req, res, next) => {
  res.render("register");
};

//@desc Register user
//@route POST /register
//@access Public

exports.registerUser = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.password;
  const ip = req.ip;

  let newUser = new User({
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
