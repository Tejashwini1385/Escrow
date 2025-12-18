// // backend/index.js
// require("dotenv").config();

// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");
// const mongoose = require("mongoose");
// const { Server } = require("socket.io");

// const { generateRandomPrice } = require("./priceGenerator");

// // ================= APP SETUP =================
// const app = express();
// app.use(express.json());

// // ================= CORS CONFIG =================
// const CLIENT_ORIGIN =
//   process.env.CLIENT_ORIGIN || "http://localhost:5173";
// const ALLOW_ALL_ORIGINS = process.env.ALLOW_ALL_ORIGINS === "true";

// if (ALLOW_ALL_ORIGINS) {
//   console.warn("⚠️ ALLOW_ALL_ORIGINS enabled (dev only)");
//   app.use(cors());
// } else {
//   app.use(
//     cors({
//       origin: CLIENT_ORIGIN,
//       credentials: true,
//       optionsSuccessStatus: 200,
//     })
//   );
// }

// // ================= HTTP + SOCKET =================
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ALLOW_ALL_ORIGINS ? "*" : CLIENT_ORIGIN,
//     methods: ["GET", "POST"],
//   },
// });

// // ================= DATABASE =================
// const MONGO_URI =
//   process.env.MONGO_URI ||
//   process.env.MONGODB_URI ||
//   "mongodb://localhost:27017/stockdash";

// mongoose
//   .connect(MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB error:", err));

// // ================= ROUTES =================
// const authRoutes = require("./routes/auth");
// const subscriptionRoutes = require("./routes/subscriptions");
// const tradeRoutes = require("./routes/trade");

// app.use("/api/auth", authRoutes);
// app.use("/api/subscriptions", subscriptionRoutes);
// app.use("/api/trade", tradeRoutes);

// // ================= HEALTH =================
// app.get("/", (req, res) => {
//   res.send("Stock Trading Backend is running ✅");
// });

// // ================= SOCKET PRICE ENGINE =================
// const STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

// // Live prices (realistic base)
// let prices = {};
// STOCKS.forEach((ticker) => {
//   prices[ticker] = generateRandomPrice(ticker);
// });

// // Connected users (for stats)
// const connectedUsers = new Map();

// function broadcastUserCount() {
//   io.emit("user-count", { count: connectedUsers.size });
// }

// io.on("connection", (socket) => {
//   console.log("🔌 Socket connected:", socket.id);

//   socket.on("join", ({ email }) => {
//     connectedUsers.set(socket.id, email || "unknown");
//     broadcastUserCount();

//     // Send current prices immediately
//     socket.emit("initial-prices", { prices });
//     console.log(`👤 Joined: ${email}`);
//   });

//   socket.on("disconnect", () => {
//     connectedUsers.delete(socket.id);
//     broadcastUserCount();
//     console.log("❌ Socket disconnected:", socket.id);
//   });
// });

// // ================= PRICE TICK (GLOBAL MARKET) =================
// setInterval(() => {
//   STOCKS.forEach((ticker) => {
//     const newPrice = generateRandomPrice(ticker);
//     prices[ticker] = newPrice;

//     io.emit("price-update", {
//       ticker,
//       price: newPrice,
//       time: Date.now(),
//     });
//   });
// }, 1000); // 1 second tick like real market feed

// // ================= FRONTEND STATIC SERVE =================
// const possibleBuilds = [
//   path.join(__dirname, "..", "frontend", "dist"),  // Vite
//   path.join(__dirname, "..", "frontend", "build"), // CRA
// ];

// let buildPath = null;
// for (const p of possibleBuilds) {
//   if (fs.existsSync(p)) {
//     buildPath = p;
//     break;
//   }
// }

// if (buildPath) {
//   console.log("📦 Serving frontend from:", buildPath);
//   app.use(express.static(buildPath));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(buildPath, "index.html"));
//   });
// } else {
//   console.log("ℹ️ No frontend build found (API-only mode)");
// }

// // ================= START SERVER =================
// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`🚀 Backend running on port ${PORT}`);
//   console.log(`🌍 CLIENT_ORIGIN = ${CLIENT_ORIGIN}`);
// });
// backend/index.js
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const { generateRandomPrice } = require("./priceGenerator");

// ================= APP SETUP =================
const app = express();
app.use(express.json());

// ================= CORS CONFIG =================
// Local dev → http://localhost:5173
// Render prod → https://your-frontend.onrender.com
const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Render-friendly toggle
const ALLOW_ALL_ORIGINS = process.env.ALLOW_ALL_ORIGINS === "true";

if (ALLOW_ALL_ORIGINS) {
  console.warn("⚠️ ALLOW_ALL_ORIGINS enabled");
  app.use(cors({ origin: "*" }));
} else {
  app.use(
    cors({
      origin: CLIENT_ORIGIN,
      credentials: true,
    })
  );
}

// ================= HTTP + SOCKET =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ALLOW_ALL_ORIGINS ? "*" : CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// ================= DATABASE =================
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/stockdash";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1); // stop server if DB fails
  });

// ================= ROUTES =================
const authRoutes = require("./routes/auth");
const subscriptionRoutes = require("./routes/subscriptions");
const tradeRoutes = require("./routes/trade");

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/trade", tradeRoutes);

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.send("Stock Trading Backend is running ✅");
});

// ================= SOCKET PRICE ENGINE =================
const STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

// Live prices
let prices = {};
STOCKS.forEach((ticker) => {
  prices[ticker] = generateRandomPrice(ticker);
});

// Connected users
const connectedUsers = new Map();

function broadcastUserCount() {
  io.emit("user-count", { count: connectedUsers.size });
}

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join", ({ email }) => {
    connectedUsers.set(socket.id, email || "unknown");
    broadcastUserCount();

    socket.emit("initial-prices", { prices });
    console.log(`👤 Joined: ${email}`);
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    broadcastUserCount();
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ================= PRICE TICK =================
setInterval(() => {
  STOCKS.forEach((ticker) => {
    const newPrice = generateRandomPrice(ticker);
    prices[ticker] = newPrice;

    io.emit("price-update", {
      ticker,
      price: newPrice,
      time: Date.now(),
    });
  });
}, 1000);

// ================= FRONTEND STATIC SERVE =================
const possibleBuilds = [
  path.join(__dirname, "..", "frontend", "dist"),  // Vite
  path.join(__dirname, "..", "frontend", "build"), // CRA
];

let buildPath = null;
for (const p of possibleBuilds) {
  if (fs.existsSync(p)) {
    buildPath = p;
    break;
  }
}

if (buildPath) {
  console.log("📦 Serving frontend from:", buildPath);
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  console.log("ℹ️ No frontend build found (API-only mode)");
}

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🌍 CLIENT_ORIGIN = ${CLIENT_ORIGIN}`);
});
