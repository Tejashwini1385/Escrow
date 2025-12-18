const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");

/**
 * ============================
 * GET WATCHLIST
 * GET /api/subscriptions?email=abc@gmail.com
 * ============================
 */
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    const watchlist = await Subscription.find({
      userEmail: email,
      active: false, // watchlist only
    }).select("ticker -_id");

    res.json(watchlist);
  } catch (err) {
    console.error("Watchlist fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ============================
 * GET ACTIVE TRADES
 * GET /api/subscriptions/active?email=abc@gmail.com
 * ============================
 */
router.get("/active", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

    const activeTrades = await Subscription.find({
      userEmail: email,
      active: true,
    }).select("ticker entryPrice invested -_id");

    res.json(activeTrades);
  } catch (err) {
    console.error("Active trades fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ============================
 * ADD TO WATCHLIST
 * POST /api/subscriptions
 * ============================
 */
router.post("/", async (req, res) => {
  try {
    const { userEmail, ticker } = req.body;
    if (!userEmail || !ticker)
      return res.status(400).json({ error: "Missing fields" });

    const exists = await Subscription.findOne({ userEmail, ticker });
    if (exists)
      return res.status(400).json({ error: "Already exists" });

    await Subscription.create({
      userEmail,
      ticker,
      active: false,
      invested: 0,
      entryPrice: 0,
    });

    res.status(201).json({ message: "Added to watchlist" });
  } catch (err) {
    console.error("Add watchlist error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ============================
 * REMOVE FROM WATCHLIST
 * POST /api/subscriptions/remove
 * ============================
 */
router.post("/remove", async (req, res) => {
  try {
    const { userEmail, ticker } = req.body;

    await Subscription.deleteOne({
      userEmail,
      ticker,
      active: false, // do not touch active trades
    });

    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    console.error("Remove watchlist error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
