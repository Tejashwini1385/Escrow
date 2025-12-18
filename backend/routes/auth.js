const express = require("express");
const router = express.Router();
const User = require("../models/user");

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await User.create({
      email,
      password,
      balance: 0, // wallet starts empty (realistic)
    });

    res.status(201).json({
      id: user._id,
      email: user.email,
    });
  } catch (err) {
    console.error("REGISTER error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      id: user._id,
      email: user.email,
    });
  } catch (err) {
    console.error("LOGIN error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= GET USER (DASHBOARD) ================= */
router.get("/me", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      email: user.email,
      balance: user.balance,
    });
  } catch (err) {
    console.error("ME error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= DEPOSIT MONEY ================= */
/* ================= ADD MONEY ================= */
router.post("/add-balance", async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount || amount <= 0)
      return res.status(400).json({ error: "Invalid amount" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance += Number(amount);
    await user.save();

    res.json({ balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= WITHDRAW MONEY ================= */
/* ================= WITHDRAW MONEY ================= */
router.post("/withdraw", async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || amount == null)
      return res.status(400).json({ error: "Missing fields" });

    const withdrawAmt = Number(amount);
    if (isNaN(withdrawAmt) || withdrawAmt <= 0)
      return res.status(400).json({ error: "Invalid amount" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < withdrawAmt)
      return res.status(400).json({ error: "Insufficient balance" });

    user.balance -= withdrawAmt;
    await user.save();

    res.json({
      message: "Withdrawal successful",
      balance: user.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
