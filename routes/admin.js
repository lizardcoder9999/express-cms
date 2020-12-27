const express = require("express");

const {
  renderAdminLogin,
  loginAdmin,
} = require("../controllers/adminController");

const router = express.Router();

router.route("/admin/login").get(renderAdminLogin).post(loginAdmin);

module.exports = router;
