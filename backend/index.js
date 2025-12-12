// // backend/index.js  (simple-auth version)
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { generateRandomPrice } = require("./priceGenerator");



const app = express();
app.use(cors());
app.use(express.json());

// ---------- MONGODB CONNECT ----------
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/stockdash";
// connect without legacy options — modern mongoose does not need them
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connect error:", err);
    process.exit(1);
  });


// mount simple auth & subscriptions routes
const authRoutes = require("./routes/auth");
const subsRoutes = require("./routes/subscriptions");
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subsRoutes);

// simple root route / health
app.get("/", (req, res) => {
  res.send("Stock Dashboard backend is running ✅");
});

// --- your existing socket + price logic below (unchanged) ---
const STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];
let prices = {};
STOCKS.forEach((t) => (prices[t] = generateRandomPrice()));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const connectedUsers = new Map();
function broadcastUserCount() {
  const count = connectedUsers.size;
  io.emit("user-count", { count });
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (data) => {
    const email = data?.email || "unknown";
    connectedUsers.set(socket.id, email);
    console.log(`User logged in: ${email} (socket ${socket.id})`);
    broadcastUserCount();
    socket.emit("initial-prices", { prices });
  });

  socket.on("subscribe", (ticker) => {
    if (!STOCKS.includes(ticker)) {
      console.warn(`Subscribe request for unknown ticker: ${ticker} by ${socket.id}`);
      return;
    }
    console.log(`Subscribed: ${ticker} (socket ${socket.id})`);
    socket.join(ticker);
    socket.emit("price-update", { ticker, price: prices[ticker] });
  });

  socket.on("unsubscribe", (ticker) => {
    console.log(`Unsubscribed: ${ticker} (socket ${socket.id})`);
    socket.leave(ticker);
  });

  socket.on("disconnect", () => {
    const email = connectedUsers.get(socket.id) || "unknown";
    connectedUsers.delete(socket.id);
    console.log(`User disconnected: ${socket.id} (${email})`);
    broadcastUserCount();
  });
});

// price emit
setInterval(() => {
  STOCKS.forEach((ticker) => {
    prices[ticker] = generateRandomPrice();
    io.to(ticker).emit("price-update", { ticker, price: prices[ticker] });
  });
}, 1000);

// serve frontend build if exists
const buildPath = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(buildPath)) {
  console.log("Serving frontend from", buildPath);
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  console.log("No frontend build found — skipping static serve.");
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
// backend/index.js  (improved simple-auth version)
// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');
// const mongoose = require('mongoose');
// const { Server } = require('socket.io');

// const { generateRandomPrice } = require('./priceGenerator'); // keep this file
// // make sure ./routes/auth and ./routes/subscriptions exist and use env vars for creds

// const app = express();
// app.use(express.json());

// // ---------- CONFIG / CORS ----------
// /*
//   Set CLIENT_ORIGIN in Render/Vercel as "https://your-frontend-domain"
//   For local dev, you can leave it unset (defaults to http://localhost:3000)
// */
// const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
// const ALLOW_ALL_ORIGINS = process.env.ALLOW_ALL_ORIGINS === 'true'; // opt-in fallback

// if (ALLOW_ALL_ORIGINS) {
//   console.warn('WARNING: ALLOW_ALL_ORIGINS=true — CORS is wide open (dev only).');
//   app.use(cors());
// } else {
//   // restrict to specific origin (recommended)
//   app.use(cors({ origin: CLIENT_ORIGIN }));
// }

// // ---------- MONGODB CONNECT ----------
// const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/stockdash';

// mongoose.connect(MONGO_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => {
//     console.error('MongoDB connect error:', err);
//     process.exit(1);
//   });

// // ---------- ROUTES ----------
// const authRoutes = require('./routes/auth'); // should use process.env.ADMIN_USER & ADMIN_PASS
// const subsRoutes = require('./routes/subscriptions');
// app.use('/api/auth', authRoutes);
// app.use('/api/subscriptions', subsRoutes);

// app.get('/', (req, res) => res.send('Stock Dashboard backend is running ✅'));

// // ---------- SOCKETS & PRICE LOGIC ----------
// const STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];
// let prices = {};
// STOCKS.forEach((t) => (prices[t] = generateRandomPrice()));

// const server = http.createServer(app);

// // ensure socket.io uses same origin settings as express
// const io = new Server(server, {
//   cors: {
//     origin: ALLOW_ALL_ORIGINS ? '*' : CLIENT_ORIGIN,
//     methods: ['GET', 'POST'],
//   },
// });

// const connectedUsers = new Map();
// function broadcastUserCount() {
//   io.emit('user-count', { count: connectedUsers.size });
// }

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('join', (data) => {
//     const email = data?.email || 'unknown';
//     connectedUsers.set(socket.id, email);
//     console.log(`User logged in: ${email} (socket ${socket.id})`);
//     broadcastUserCount();
//     socket.emit('initial-prices', { prices });
//   });

//   socket.on('subscribe', (ticker) => {
//     if (!STOCKS.includes(ticker)) {
//       console.warn(`Subscribe request for unknown ticker: ${ticker} by ${socket.id}`);
//       return;
//     }
//     socket.join(ticker);
//     socket.emit('price-update', { ticker, price: prices[ticker] });
//   });

//   socket.on('unsubscribe', (ticker) => {
//     socket.leave(ticker);
//   });

//   socket.on('disconnect', () => {
//     const email = connectedUsers.get(socket.id) || 'unknown';
//     connectedUsers.delete(socket.id);
//     console.log(`User disconnected: ${socket.id} (${email})`);
//     broadcastUserCount();
//   });
// });

// // price emit every second
// setInterval(() => {
//   STOCKS.forEach((ticker) => {
//     prices[ticker] = generateRandomPrice();
//     io.to(ticker).emit('price-update', { ticker, price: prices[ticker] });
//   });
// }, 1000);

// // ---------- STATIC FRONTEND SERVE (if build exists) ----------
// const checkPaths = [
//   path.join(__dirname, '..', 'frontend', 'dist'),  // Vite / some bundlers
//   path.join(__dirname, '..', 'frontend', 'build'), // CRA
// ];

// let buildPath = null;
// for (const p of checkPaths) {
//   if (fs.existsSync(p)) {
//     buildPath = p;
//     break;
//   }
// }

// if (buildPath) {
//   console.log('Serving frontend from', buildPath);
//   app.use(express.static(buildPath));
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(buildPath, 'index.html'));
//   });
// } else {
//   console.log('No frontend build found — skipping static serve.');
// }

// // ---------- START SERVER ----------
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Backend server running on port ${PORT}`);
//   if (!process.env.PORT) {
//     console.log(`Local: http://localhost:${PORT}`);
//   }
//   console.log(`CLIENT_ORIGIN = ${CLIENT_ORIGIN}`);
// });
