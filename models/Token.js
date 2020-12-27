const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  tokenUser: {
    type: String,
    required: true,
  },

  tokenVal: {
    type: String,
    required: true,
  },

  tokenExpiration: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("tokens", TokenSchema);
