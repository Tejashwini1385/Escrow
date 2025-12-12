import React from "react";
import "./Home.css";

const TICKERS = [
  { t: "ENRIN", p: "2911.00", c: "-2.85%" },
  { t: "METROBRAND", p: "1155.20", c: "-2.66%" },
  { t: "GODREJIND", p: "3227.00", c: "-2.13%" },
  { t: "NVDA", p: "128.00", c: "+1.20%" },
  { t: "AAPL", p: "178.25", c: "+0.40%" },
];

const STOCK_SUMMARY = [
  { ticker: "GOOG", price: "2,800.54", change: "+0.85%" },
  { ticker: "TSLA", price: "716.21", change: "-1.12%" },
  { ticker: "AMZN", price: "3,402.12", change: "+0.34%" },
  { ticker: "META", price: "320.88", change: "+0.12%" },
  { ticker: "NVDA", price: "610.45", change: "+1.95%" },
];

export default function Home({ onShowRegister }) {
  return (
    <main className="home-root">
      {/* Ticker strip */}
      <div className="ticker-wrap" aria-hidden>
        <div className="ticker-inner">
          {TICKERS.concat(TICKERS).map((x, i) => (
            <div key={i} className="ticker-item">
              <strong>{x.t}</strong> {x.p}{" "}
              <span className={`tick-change ${x.c.startsWith("-") ? "neg" : "pos"}`}>{x.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">
            Stock Markets Today:
            <span className="hero-title-accent"> Stay Ahead</span>
          </h1>
          <p className="hero-sub">
            A lightweight stock broker demo with live-like prices, quick subscriptions and a clean UX.
          </p>

          {/* <div className="hero-actions">
            <input className="hero-search" placeholder="Search Stock, index, MF (e.g. GOOG)" />
            <button className="hero-cta" onClick={onShowRegister}>
              Sign up for free
            </button>
          </div> */}

          <div className="hero-features">
            <div className="hf-item">
              <div className="hf-title">Simple Watchlist</div>
              <div className="hf-desc">Subscribe to top tickers and receive simulated live updates.</div>
            </div>
            <div className="hf-item">
              <div className="hf-title">Clean UI</div>
              <div className="hf-desc">Responsive, professional look for interviews and demos.</div>
            </div>
            <div className="hf-item">
              <div className="hf-title">Socket Driven</div>
              <div className="hf-desc">Real-time prices (simulated server pushes every second).</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="summary-card">
            <div className="summary-head">
              <div className="summary-title">Market Snapshot</div>
              <div className="summary-sub">Top picks</div>
            </div>

            <div className="summary-grid">
              {STOCK_SUMMARY.map((s) => (
                <div key={s.ticker} className="sm-card">
                  <div className="sm-left">
                    <div className="sm-ticker">{s.ticker}</div>
                    <div className="sm-price">{s.price}</div>
                  </div>
                  <div className={`sm-change ${s.change.startsWith("-") ? "neg" : "pos"}`}>{s.change}</div>
                </div>
              ))}
            </div>

            <div className="chart-wrap" role="img" aria-label="Sample market chart">
              {/* simple SVG placeholder chart */}
              <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="chart-svg">
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,110 L40,100 L80,82 L120,88 L160,60 L200,68 L240,40 L280,50 L320,30 L360,44 L400,28 L440,36 L480,20 L520,26 L560,18 L600,12 L600,160 L0,160 Z"
                  fill="url(#g1)"
                  stroke="none"
                />
                <polyline
                  points="0,110 40,100 80,82 120,88 160,60 200,68 240,40 280,50 320,30 360,44 400,28 440,36 480,20 520,26 560,18 600,12"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="summary-footer">
              <div>Live-like prices (simulated)</div>
              <div className="small-cta">Made for hiring assignment</div>
            </div>
          </div>
        </div>
      </section>

      {/* MORE CONTENT - cards and features */}
      <section className="cards-section">
        <h3 className="section-title">Why this platform?</h3>
        <div className="cards-grid">
          <article className="card feature">
            <h4>Subscribe & Track</h4>
            <p>Choose tickers from the supported list and subscribe to receive real-time updates via WebSockets.</p>
          </article>

          <article className="card feature">
            <h4>Clean Architecture</h4>
            <p>React frontend + Node.js backend + Socket.IO for real-time updates and MongoDB for simple persistence.</p>
          </article>

          <article className="card feature">
            <h4>Ready for Submission</h4>
            <p>Lightweight, easy-to-deploy demo you can include as a GitHub repo for the hiring assignment.</p>
          </article>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} Stock Broker Client</div>
          <div>Developed by Tejashwini · For hiring assignment</div>
        </div>
      </footer>
    </main>
  );
}
