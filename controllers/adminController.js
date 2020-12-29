const User = require("../models/User");
const bcrypt = require("bcrypt");
const express = require("express");
const loginNotification = require("../utils/mail");
const path = require("path");
const session = require("express-session");
const passport = require("passport");

//@desc Login Admin
//@route GET /admin/login
//@access Admin

exports.renderAdminLogin = async (req, res, next) => {
  await res.render("adminlogin");
};

//@desc Login Admin, This route will filter admins based on role so only admins can login
//@route POST /admin/login
//@access admin

exports.loginAdmin = async (req, res, next) => {
  const username = req.body.username;
  const requestIp = req.ip;
  const adminTime = new Date();

  await User.findOne({ username: username }),
    (err, obj) => {
      if (err) {
        throw err;
      } else {
        try {
          if (obj.role != "admin") {
            res.redirect("/login");
          } else {
            if (requestIp != obj.lastIp) {
              loginNotification(username, requestIp, adminTime, obj.email);
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
        } catch (error) {
          console.log(error);
        }
      }
    };
  passport.authenticate("local", {
    successRedirect: "/admin/home",
    failureRedirect: "/admin/login",
  })(req, res, next);
  ses = req.session;
  ses.admin = "admin";
  ses.username = username;
};

//@desc Renders add user page
//@route GET /admin/adduser
//@access Admin

exports.renderAddUser = async (req, res, next) => {
  if (req.session.admin != "admin") {
    await res.redirect("/admin/login"); //Create template for this
  } else {
    await res.render("adminadduser");
  }
};

//@desc Creates new user
//@route POST /admin/adduser
//@access Public

exports.createUser = async (req, res, next) => {
  if (req.session.admin != "admin") {
    await res.redirect("/admin/login");
  } else {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const email = req.body.email;
      const ip = req.ip;
      const role = req.body.role;

      let newUser = await new User({
        username: username,
        password: password,
        email: email,
        lastIp: ip,
        role: role,
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
              res.redirect("/admin/adduser");
            }
          });
        });
      });
    } catch (error) {
      throw error;
    }
  }
};
