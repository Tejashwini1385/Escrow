const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Subscription = require("../models/Subscription");
const Order = require("../models/order");

/**
 * ======================
 * BUY STOCK
 * ======================
 */
router.post("/buy", async (req, res) => {
  try {
    const { email, ticker, price, amount } = req.body;

    if (!email || !ticker || !price || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid buy request data" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    // Deduct wallet
    user.balance -= amount;
    await user.save();

    // Open / overwrite active trade
    await Subscription.updateOne(
      { userEmail: email, ticker },
      {
        invested: amount,
        entryPrice: price,
        active: true,
      },
      { upsert: true }
    );

    await Order.create({
      userEmail: email,
      ticker,
      type: "BUY",
      price,
      amount,
    });

    return res.json({
      balance: user.balance,
      message: "Position opened",
    });
  } catch (err) {
    console.error("BUY error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * ======================
 * SELL STOCK
 * ======================
 */
router.post("/sell", async (req, res) => {
  try {
    const { email, ticker, price } = req.body;

    if (!email || !ticker || !price) {
      return res.status(400).json({ error: "Invalid sell request data" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const sub = await Subscription.findOne({
      userEmail: email,
      ticker,
      active: true,
    });

    if (!sub) {
      return res.status(400).json({ error: "No active trade to sell" });
    }

    // PnL
    const sellValue = (price / sub.entryPrice) * sub.invested;

    user.balance += sellValue;
    await user.save();

    sub.active = false;
    sub.invested = 0;
    sub.entryPrice = 0;
    await sub.save();

    await Order.create({
      userEmail: email,
      ticker,
      type: "SELL",
      price,
      amount: sellValue,
    });

    return res.json({
      balance: user.balance,
      message: "Position closed",
    });
  } catch (err) {
    console.error("SELL error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
