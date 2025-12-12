// // backend/routes/subscriptions.js
// const express = require("express");
// const router = express.Router();

// // use relative path to models (from routes/ to models/)
// const User = require("../models/user");
// const Subscription = require("../models/Subscription");


// // helper: verify email+password presence and correctness
// async function verify(req) {
//   const email = req.body.email || req.query.email;
//   const password = req.body.password || req.query.password;
//   if (!email || !password) return { ok: false, message: "Missing auth" };
//   const user = await User.findOne({ email });
//   if (!user || user.password !== password) return { ok: false, message: "Invalid credentials" };
//   return { ok: true, user };
// }

// // GET /api/subscriptions?email=...&password=...
// router.get("/", async (req, res) => {
//   const v = await verify(req);
//   if (!v.ok) return res.status(401).json({ error: v.message });
//   const subs = await Subscription.find({ userEmail: v.user.email }).select("ticker -_id");
//   res.json(subs.map(s => s.ticker));
// });

// // POST /api/subscriptions  body: { email, password, ticker }
// router.post("/", async (req, res) => {
//   const v = await verify(req);
//   if (!v.ok) return res.status(401).json({ error: v.message });
//   const ticker = (req.body.ticker || "").toUpperCase();
//   if (!ticker) return res.status(400).json({ error: "Missing ticker" });
//   try {
//     const s = await Subscription.create({ userEmail: v.user.email, ticker });
//     return res.status(201).json({ ticker: s.ticker });
//   } catch (err) {
//     if (err.code === 11000) return res.status(409).json({ error: "Already subscribed" });
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// // DELETE /api/subscriptions  body: { email, password, ticker }
// router.delete("/", async (req, res) => {
//   const v = await verify(req);
//   if (!v.ok) return res.status(401).json({ error: v.message });
//   const ticker = (req.body.ticker || "").toUpperCase();
//   if (!ticker) return res.status(400).json({ error: "Missing ticker" });
//   await Subscription.deleteOne({ userEmail: v.user.email, ticker });
//   res.status(204).end();
// });

// module.exports = router;

// backend/routes/subscriptions.js
const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");

// GET /api/subscriptions?email=xyz
router.get("/", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Missing email" });
    const list = await Subscription.find({ userEmail: email }).select("ticker amount -_id").lean();
    return res.json(list);
  } catch (err) {
    console.error("subscriptions GET err:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST create subscription
router.post("/", async (req, res) => {
  try {
    const { userEmail, ticker, amount } = req.body;
    if (!userEmail || !ticker) return res.status(400).json({ error: "Missing fields" });

    const doc = await Subscription.create({
      userEmail,
      ticker,
      amount: typeof amount === "number" ? amount : amount ? Number(amount) : null,
    });

    return res.status(201).json({ ok: true, subscription: { ticker: doc.ticker, amount: doc.amount } });
  } catch (err) {
    console.error("subscribe err:", err);
    if (err.code === 11000) return res.status(400).json({ error: "Already subscribed" });
    return res.status(500).json({ error: "Server error" });
  }
});

// POST unsubscribe (simple)
router.post("/unsubscribe", async (req, res) => {
  try {
    const { userEmail, ticker } = req.body;
    if (!userEmail || !ticker) return res.status(400).json({ error: "Missing fields" });
    await Subscription.deleteOne({ userEmail, ticker });
    return res.json({ ok: true });
  } catch (err) {
    console.error("unsub err:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
