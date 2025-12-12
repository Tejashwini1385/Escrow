import React, { useEffect, useState, useRef } from "react";
import "./Dashboard.css";
import { socket } from "../socket";
import { apiUrl } from "../services/api";

const SUPPORTED_STOCKS = ["GOOG","TSLA","AMZN","META","NVDA"];

export default function Dashboard({ user, onLogout }) {
  const [prices, setPrices] = useState({});
  // subs: array of { ticker, amount } from backend (amount may be null)
  const [subs, setSubs] = useState([]);
  const [connectedCount, setConnectedCount] = useState(0);
  const prevPrices = useRef({});
  const [flashMap, setFlashMap] = useState({});
  const [minMax, setMinMax] = useState({}); // { ticker: { min, max } }

  useEffect(() => {
    // connect socket and announce user
    try { socket.connect(); socket.emit("join", { email: user.email }); } catch (e) {}

    // initial prices
    socket.on("initial-prices", (data) => {
      if (data && data.prices) {
        prevPrices.current = { ...data.prices };
        setPrices(data.prices);
        // initialize minMax
        const mm = {};
        Object.keys(data.prices).forEach(t => mm[t] = { min: data.prices[t], max: data.prices[t] });
        setMinMax(mm);
      }
    });

    socket.on("price-update", ({ ticker, price }) => {
      setPrices(prev => {
        const old = prev[ticker];
        // update minMax
        setMinMax(m => {
          const cur = m[ticker] || { min: price, max: price };
          const next = { min: Math.min(cur.min ?? price, price), max: Math.max(cur.max ?? price, price) };
          return { ...m, [ticker]: next };
        });

        // flash
        if (typeof old !== "undefined") {
          const dir = price > old ? "up" : price < old ? "down" : undefined;
          if (dir) {
            setFlashMap(m => ({ ...m, [ticker]: dir }));
            setTimeout(() => setFlashMap(m => { const copy = { ...m }; delete copy[ticker]; return copy; }), 900);
          }
        }
        prevPrices.current[ticker] = price;
        return { ...prev, [ticker]: price };
      });
    });

    socket.on("user-count", (d) => setConnectedCount(d.count || 0));

    return () => {
      socket.off("initial-prices");
      socket.off("price-update");
      socket.off("user-count");
    };
  }, [user.email]);

  useEffect(() => {
    // load persisted subscriptions for user (expects array of { ticker, amount })
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/subscriptions?email=" + encodeURIComponent(user.email)));
        if (res.ok) {
          const list = await res.json();
          // normalize: make sure each item has ticker and amount
          setSubs((list || []).map(x => ({ ticker: x.ticker, amount: x.amount ?? null })));
        }
      } catch (err) { console.warn("Failed to load subs", err); }
    })();
  }, [user.email]);

  async function subscribe(ticker) {
    // if already subscribed
    if (subs.find(s => s.ticker === ticker)) return;

    // prompt for amount (simple demo). You can replace with modal for nicer UI.
    const amountStr = window.prompt(`Enter amount / quantity to subscribe for ${ticker} (optional):`, "");
    if (amountStr === null) return; // user cancelled
    let amount = null;
    if (amountStr.trim() !== "") {
      amount = Number(amountStr);
      if (Number.isNaN(amount) || amount < 0) {
        alert("Invalid amount. Please enter a valid number or leave empty.");
        return;
      }
    }

    try {
      const res = await fetch(apiUrl("/api/subscriptions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, ticker, amount }),
      });
      const body = await res.json().catch(()=>({}));
      if (!res.ok) {
        alert(body.error || "Failed to subscribe");
        return;
      }
      // persist success -> join socket room so server will push updates to this socket
      socket.emit("subscribe", ticker);
      setSubs(prev => [...prev, { ticker, amount }]);
    } catch (err) {
      console.error("Network error while subscribing", err);
      alert("Network error while subscribing — check backend is running.");
    }
  }

  async function unsubscribe(ticker) {
    if (!subs.find(s => s.ticker === ticker)) return;
    try {
      const res = await fetch(apiUrl("/api/subscriptions/unsubscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, ticker }),
      });
      const body = await res.json().catch(()=>({}));
      if (!res.ok) {
        alert(body.error || "Failed to unsubscribe");
        return;
      }
      socket.emit("unsubscribe", ticker);
      setSubs(prev => prev.filter(s => s.ticker !== ticker));
    } catch (err) {
      console.error("Network error while unsubscribing", err);
      alert("Network error while unsubscribing — check backend is running.");
    }
  }

  function shareSubscription(ticker) {
    const sub = subs.find(s => s.ticker === ticker);
    const price = prices[ticker] ?? "—";
    const amountText = sub && sub.amount != null ? `Amount: ${sub.amount}` : "Amount: (not set)";
    const text = `Stock subscription\nTicker: ${ticker}\nPrice: ${price}\n${amountText}\nFrom: ${user.email}`;
    // use Web Share API if available
    if (navigator.share) {
      navigator.share({ title: `Subscription: ${ticker}`, text }).catch(()=>{});
    } else {
      // fallback: copy to clipboard
      navigator.clipboard?.writeText(text).then(() => {
        alert("Subscription details copied to clipboard. Share it in WhatsApp or email.");
      }).catch(() => {
        prompt("Copy this text:", text);
      });
    }
  }

  // helper to show display amount
  function getSubAmount(ticker) {
    const s = subs.find(x => x.ticker === ticker);
    return s ? s.amount : null;
  }

  return (
    <div className="db-root">
      <div className="db-header">
        <div className="db-left">
          <h2>Welcome, <span className="db-email">{user.email}</span></h2>
          <div className="db-meta">Connected users: {connectedCount} · Subscriptions: {subs.length}</div>
        </div>
        <div className="db-right">
          <button className="db-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* grid forced into 2 rows layout (3 columns preferred) */}
      <div className="db-stock-grid two-rows">
        {SUPPORTED_STOCKS.map((t, idx) => {
          const price = (prices[t] === undefined) ? "—" : prices[t];
          const isSub = !!subs.find(s => s.ticker === t);
          const flash = flashMap[t];
          const mm = minMax[t] || { min: price, max: price };

          return (
            <div key={t} className={`stock-card ${isSub ? "subbed" : ""}`}>
              {/* decorative triangle */}
              <div className="card-triangle" aria-hidden></div>

              <div className="stock-head">
                <div>
                  <div className="ticker">{t}</div>
                  <div className="price">
                    <span className={flash === "up" ? "price-up" : flash === "down" ? "price-down" : ""}>{price}</span>
                  </div>
                </div>

                <div className="stock-actions-vert">
                  <div className="stock-actions">
                    {isSub ? (
                      <>
                        <button className="btn-unsub" onClick={() => unsubscribe(t)}>Unsubscribe</button>
                      </>
                    ) : (
                      <button className="btn-sub" onClick={() => subscribe(t)}>Subscribe</button>
                    )}
                  </div>

                  {/* subscription details and share */}
                  {isSub && (
                    <div className="sub-details">
                      <div className="sub-amt">Amt: {getSubAmount(t) ?? "-"}</div>
                      <button className="btn-share" onClick={() => shareSubscription(t)}>Share</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="db-footer">
        <div>© {new Date().getFullYear()} Stock Broker Client — Developed by Tejashwini</div>
      </footer>
    </div>
  );
}
