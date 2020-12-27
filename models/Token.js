const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  tokenUser: {
    type: String,
    required: true,
  },

  tokenValue: {
    type: String,
    required: true,
  },

  tokenExpiration: {
    type: String,
    required: true,
  },
});
