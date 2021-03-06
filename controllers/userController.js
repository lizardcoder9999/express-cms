const User = require("../models/User");
const bcrypt = require("bcrypt");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const {
  loginNotification,
  passwordResetEmail,
  passwordResetNotification,
} = require("../utils/mail");
const { time } = require("console");
const cookieSession = require("cookie-session");
require("../config/passport-google");
const Token = require("../models/Token");
const { token } = require("morgan");
const generate = require("meaningful-string");
const { json } = require("body-parser");

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
  const email = req.body.email;
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
  ses.userlogger = "loggedin";
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
  const username = req.body.username;
  const add_minutes = function (dt, minutes) {
    return new Date(dt.getTime() + minutes * 60000);
  };
  const time = add_minutes(new Date(), 10).toString();
  const decimalTime = time.replace(/:/g, "").substr("16", "6");
  const tokenExp = decimalTime;
  const options = {
    min: 15,
    max: 16,
    capsWithNumbers: true,
  };
  const token = generate.random(options);

  await User.findOne({ username: username }, (err, obj) => {
    const userEmail = obj.email;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(token, salt, (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          let newToken = new Token({
            tokenUser: username,
            tokenVal: hash,
            tokenExpiration: tokenExp,
          });
          const resetLink = `https://localhost:5000/password/reset/${token}/${username}`;
          newToken.save();
          passwordResetEmail(username, userEmail, resetLink);
          res.redirect("/login");
        }
      });
    });
  });
};

//@desc Reset Password
//@route GET /password/reset/:token/:username
//@access Public

exports.renderUpdateReset = async (req, res, next) => {
  const userToken = req.params.token;
  const username = req.params.username;
  await res.render("resetpass", { username: username, token: userToken });
};

//@desc Reset Password
//@route POST /password/reset/:token/:username
//@access Public

exports.passwordTokenReset = async (req, res, next) => {
  const newPassword = req.body.password;
  const confirmPassword = req.body.passwordConfirm;

  const token = req.params.token;
  const username = req.params.username;

  User.findOne({ username: username }, (err, obj) => {
    const email = obj.email;
    return email;
  });

  try {
    if (newPassword != confirmPassword) {
      res.redirect("/forgot-password");
    } else {
      await Token.findOne({ tokenUser: username }, (err, obj) => {
        const dbUserToken = obj.tokenVal;
        const TokenExpiration = obj.tokenExpiration;

        const get_time = function (dt, minutes) {
          return new Date(dt.getTime() + minutes * 60000);
        };

        const time = get_time(new Date(), 0).toString();
        const decimalTime = time.replace(/:/g, "").substr("16", "6");

        const userReqTime = decimalTime;

        if (userReqTime > TokenExpiration) {
          res.redirect("/forgot-password");
        } else {
          bcrypt.compare(token, dbUserToken, (err, res) => {
            if (res) {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(confirmPassword, salt, (err, hash) => {
                  if (err) {
                    console.log(err);
                  } else {
                    User.findOneAndUpdate(
                      { username: username },
                      { $set: { password: hash } },
                      (err, obj) => {
                        console.log("Updated");
                      }
                    );
                    Token.findOneAndDelete(
                      { tokenUser: username },
                      (err, docs) => {
                        if (err) {
                          console.log(err);
                        } else {
                          User.findOne({ username: username }, (err, obj) => {
                            const email = obj.email;
                            passwordResetNotification(username, time, email);
                            // res.redirect("/login");
                          });
                        }
                      }
                    );
                  }
                });
              });
            } else {
              res.redirect("/forgot-password");
            }
          });
        }
      });
    }
  } catch (error) {
    throw error;
  }
};

//@desc Render home page
//@route GET /home
//@access Public

exports.renderHomePage = async (req, res, next) => {
  if (req.session.userlogger != "loggedin") {
    await res.redirect("/register");
  } else {
    await res.render("userhome");
  }
};

//@desc Render user profile
//@route GET /profile
//@access Public

exports.renderUserProfile = async (req, res, next) => {
  if (req.session.userlogger != "loggedin") {
    await res.redirect("/login");
  } else {
    const username = req.session.username;
    User.findOne({ username: username }, (err, obj) => {
      const imageLink = obj.imageLink;
      await res.render("userprofile",{username:username, imageLink:imageLink});
    });
  }
};

