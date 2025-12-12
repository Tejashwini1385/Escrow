// // backend/models/Subscription.js
const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, lowercase: true },
  ticker: { type: String, required: true, uppercase: true },
  createdAt: { type: Date, default: Date.now },
});

SubscriptionSchema.index({ userEmail: 1, ticker: 1 }, { unique: true });

module.exports = mongoose.model("Subscription", SubscriptionSchema);
