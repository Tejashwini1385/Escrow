const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },

    ticker: {
      type: String,
      required: true,
    },

    // 🔹 amount invested from wallet
    invested: {
      type: Number,
      required: true,
      default: 0,
    },

    // 🔹 buy price
    entryPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    // 🔹 trade status
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Optional but good practice (1 active trade per stock per user)
SubscriptionSchema.index({ userEmail: 1, ticker: 1 }, { unique: true });

module.exports = mongoose.model("Subscription", SubscriptionSchema);
