// backend/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const { generateRandomPrice } = require('./priceGenerator'); // ensure this file exists

// ---------- APP + CONFIG ----------
const app = express();
app.use(express.json());

// Deployment-friendly config
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const ALLOW_ALL_ORIGINS = process.env.ALLOW_ALL_ORIGINS === 'true';

// Apply CORS based on environment
if (ALLOW_ALL_ORIGINS) {
  console.warn('WARNING: ALLOW_ALL_ORIGINS=true — CORS is wide open (dev only).');
  app.use(cors());
  app.options('*', cors());
} else {
  app.use(cors({ origin: CLIENT_ORIGIN }));
  app.options('*', cors({ origin: CLIENT_ORIGIN }));
}

// ---------- HTTP + Socket.IO (create before using io) ----------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOW_ALL_ORIGINS ? '*' : CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// ---------- MONGODB CONNECT ----------
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/stockdash';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connect error:', err);
    // for production you might not want to exit; uncomment to fail fast:
    // process.exit(1);
  });

// ---------- ROUTES ----------
try {
  const authRoutes = require('./routes/auth'); // ensure this exports a router
  const subsRoutes = require('./routes/subscriptions');
  app.use('/api/auth', authRoutes);
  app.use('/api/subscriptions', subsRoutes);
} catch (err) {
  console.warn('Warning: could not mount routes (check routes folder).', err.message);
}

// Health
app.get('/', (req, res) => res.send('Stock Dashboard backend is running ✅'));

// ---------- SOCKETS & PRICE LOGIC ----------
const STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];
let prices = {};
STOCKS.forEach((t) => (prices[t] = generateRandomPrice()));

const connectedUsers = new Map();
function broadcastUserCount() {
  io.emit('user-count', { count: connectedUsers.size });
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    const email = data?.email || 'unknown';
    connectedUsers.set(socket.id, email);
    console.log(`User logged in: ${email} (socket ${socket.id})`);
    broadcastUserCount();
    socket.emit('initial-prices', { prices });
  });

  socket.on('subscribe', (ticker) => {
    if (!STOCKS.includes(ticker)) {
      console.warn(`Subscribe request for unknown ticker: ${ticker} by ${socket.id}`);
      return;
    }
    console.log(`Subscribed: ${ticker} (socket ${socket.id})`);
    socket.join(ticker);
    socket.emit('price-update', { ticker, price: prices[ticker] });
  });

  socket.on('unsubscribe', (ticker) => {
    console.log(`Unsubscribed: ${ticker} (socket ${socket.id})`);
    socket.leave(ticker);
  });

  socket.on('disconnect', () => {
    const email = connectedUsers.get(socket.id) || 'unknown';
    connectedUsers.delete(socket.id);
    console.log(`User disconnected: ${socket.id} (${email})`);
    broadcastUserCount();
  });
});

// price emit every second
setInterval(() => {
  STOCKS.forEach((ticker) => {
    prices[ticker] = generateRandomPrice();
    io.to(ticker).emit('price-update', { ticker, price: prices[ticker] });
  });
}, 1000);

// ---------- STATIC FRONTEND SERVE (if build exists) ----------
const checkPaths = [
  path.join(__dirname, '..', 'frontend', 'dist'),  // Vite / some bundlers
  path.join(__dirname, '..', 'frontend', 'build'), // CRA
];

let buildPath = null;
for (const p of checkPaths) {
  if (fs.existsSync(p)) {
    buildPath = p;
    break;
  }
}

if (buildPath) {
  console.log('Serving frontend from', buildPath);
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('No frontend build found — skipping static serve.');
}

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend process listening on port ${PORT}`);
  console.log(`CLIENT_ORIGIN = ${CLIENT_ORIGIN}`);
  if (process.env.RENDER_EXTERNAL_URL) {
    console.log(`Render public URL (env): ${process.env.RENDER_EXTERNAL_URL}`);
  } else {
    console.log('Public URL when deployed: check your Render service URL in the Render dashboard.');
  }
});
