const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 0 }, // ✅ wallet
});

module.exports = mongoose.model("User", UserSchema);
