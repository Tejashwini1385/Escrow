const express = require("express");
const router = express.Router();
const User = require("../models/user");


router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 2. Enforce minimum length
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long"
      });
    }

    // 3. Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already used" });
    }

    // 4. Create user
    const user = await User.create({ email, password });

    // 5. Respond to client
    return res.status(201).json({
      id: user._id,
      email: user.email
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});


// Login (plain check)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // return simple user object (no token)
    return res.json({ id: user._id, email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
