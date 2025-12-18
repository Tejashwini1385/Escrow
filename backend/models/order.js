const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    ticker: { type: String, required: true },

    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },

    price: { type: Number, required: true },

    amount: {
      type: Number,
      required: true, // full wallet amount used
    },

    pnl: {
      type: Number,
      default: 0, // filled on SELL
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
