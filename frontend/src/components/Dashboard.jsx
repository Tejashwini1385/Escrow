import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { socket } from "../socket";
import { apiUrl } from "../services/api";

const STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

export default function Dashboard({ user }) {
  const [prices, setPrices] = useState({});
  const [history, setHistory] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [balance, setBalance] = useState(0);
  const [walletMode, setWalletMode] = useState(null);

  // ✅ Active trades state
  const [activeTrades, setActiveTrades] = useState({});

  /* ===== SOCKET ===== */
  useEffect(() => {
    socket.connect();
    socket.emit("join", { email: user.email });

    socket.on("initial-prices", ({ prices }) => {
      setPrices(prices);
      const h = {};
      Object.keys(prices).forEach(t => (h[t] = [prices[t]]));
      setHistory(h);
    });

    socket.on("price-update", ({ ticker, price }) => {
      const p = Number(price);
      setPrices(prev => ({ ...prev, [ticker]: p }));
      setHistory(h => ({
        ...h,
        [ticker]: [...(h[ticker] || []), p].slice(-30),
      }));
    });

    return () => {
      socket.off("initial-prices");
      socket.off("price-update");
    };
  }, [user.email]);

  /* ===== LOAD WALLET ===== */
  useEffect(() => {
    fetch(apiUrl("/api/auth/me?email=" + user.email))
      .then(r => r.json())
      .then(d => setBalance(d.balance || 0));
  }, [user.email]);

  /* ===== WALLET ===== */
  async function deposit(amount) {
    const res = await fetch(apiUrl("/api/auth/add-balance"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, amount }),
    });
    const d = await res.json();
    if (!res.ok) return alert(d.error);
    setBalance(d.balance);
    setWalletMode(null);
  }

  async function withdraw(amount) {
    const res = await fetch(apiUrl("/api/auth/withdraw"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, amount }),
    });
    const d = await res.json();
    if (!res.ok) return alert(d.error);
    setBalance(d.balance);
    setWalletMode(null);
  }

  /* ===== BUY ===== */
  async function buy(ticker) {
    const price = prices[ticker];
    if (!price || balance < price) return alert("Insufficient balance");

    const res = await fetch(apiUrl("/api/trade/buy"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        ticker,
        price,
        amount: price,
      }),
    });

    const d = await res.json();
    if (!res.ok) return alert(d.error);

    setBalance(d.balance);
    setActiveTrades(prev => ({ ...prev, [ticker]: true }));
    alert(`✅ Bought ${ticker}`);
  }

  /* ===== SELL ===== */
  async function sell(ticker) {
    const res = await fetch(apiUrl("/api/trade/sell"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        ticker,
        price: prices[ticker],
      }),
    });

    const d = await res.json();
    if (!res.ok) return alert(d.error);

    setBalance(d.balance);
    setActiveTrades(prev => ({ ...prev, [ticker]: false }));
    alert(`✅ Sold ${ticker}`);
  }

  return (
    <div className="dashboard-root">
      {/* ===== WALLET BAR ===== */}
      <div className="wallet-bar">
        <span>Wallet</span>
        <strong>₹{balance.toFixed(2)}</strong>
        <button className="deposit-btn" onClick={() => setWalletMode("deposit")}>
          Deposit
        </button>
        <button className="withdraw-btn" onClick={() => setWalletMode("withdraw")}>
          Withdraw
        </button>
      </div>

      {/* ===== ACTIVE TRADES ===== */}
      {Object.values(activeTrades).some(v => v) && (
        <div className="active-trades">
          <h4>Active Trades</h4>
          <ul>
            {Object.keys(activeTrades)
              .filter(t => activeTrades[t])
              .map(t => (
                <li key={t} className="active-trade-item">
                  <span>{t} @ ₹{prices[t]}</span>
                  <button
                    className="sell-btn"
                    onClick={() => sell(t)}
                  >
                    SELL
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* ===== STOCK CARDS ===== */}
      <div className="stock-grid">
        {STOCKS.map(t => {
          const pricesArr = history[t] || [];
          const current = prices[t];
          const open = pricesArr[0] || current;
          const change = (((current - open) / open) * 100).toFixed(2);

          return (
            <div className="stock-card" key={t}>
              <div className="stock-head">
                <h3>{t}</h3>
                <span className={change >= 0 ? "up" : "down"}>
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
                </span>
              </div>

              <div className="price">₹{current}</div>

              <LineGraph prices={pricesArr} />

              {!watchlist.includes(t) ? (
                <button
                  className="watch-btn"
                  onClick={() => setWatchlist(w => [...w, t])}
                >
                  + Watchlist
                </button>
              ) : (
                <div className="trade-actions">
                  {!activeTrades[t] ? (
                    <button className="buy-btn" onClick={() => buy(t)}>
                      BUY
                    </button>
                  ) : (
                    <button className="sell-btn" onClick={() => sell(t)}>
                      SELL
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {walletMode && (
        <WalletModal
          type={walletMode}
          onClose={() => setWalletMode(null)}
          onDeposit={deposit}
          onWithdraw={withdraw}
        />
      )}
    </div>
  );
}

/* ===== LINE GRAPH ===== */
function LineGraph({ prices }) {
  if (!prices || prices.length < 2) return null;

  const width = 140;
  const height = 70;
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const range = max - min || 1;

  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height}>
      <polyline
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        points={points.join(" ")}
      />
    </svg>
  );
}

/* ===== WALLET MODAL ===== */
function WalletModal({ type, onClose, onDeposit, onWithdraw }) {
  const [amt, setAmt] = useState("");

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{type === "deposit" ? "Deposit Funds" : "Withdraw Funds"}</h3>

        <input
          type="number"
          value={amt}
          onChange={e => setAmt(e.target.value)}
        />

        {type === "deposit" ? (
          <button onClick={() => onDeposit(Number(amt))}>Deposit</button>
        ) : (
          <button onClick={() => onWithdraw(Number(amt))}>Withdraw</button>
        )}

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
