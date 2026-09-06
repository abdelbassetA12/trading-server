 
import React, { useEffect, useState } from "react";
import API_BASE from "../../config/api";

export default function Backtest() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setIntervalValue] = useState("15m");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveTrades, setLiveTrades] = useState([]);

  useEffect(() => {
    run();
  }, []);

  // ================= BACKTEST =================
  const run = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/replay?symbol=${symbol}&interval=${interval}`
      );

      const data = await response.json();

      console.log("API DATA:", data);

      setResult(data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      alert("API ERROR");
    }

    setLoading(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const totalProfit =
    result?.trades?.reduce((sum, t) => sum + t.profit, 0) || 0;

  const totalTrades = result?.stats?.total || 0;

  const profitPerTrade =
    (result?.balance - 1000) / (totalTrades || 1);

  return (
    <div className="backtest-page">

      {/* ================= HEADER ================= */}
      <header className="backtest-header">

        <div className="header-title">
          <div className="header-icon">
            📊
          </div>

          <div>
            <h1>Trading Lab</h1>
            <p>Backtest your trading strategy</p>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot"></span>
          Trading Engine
          <strong>Online</strong>
        </div>

      </header>

      {/* ================= CONTROL PANEL ================= */}
      <section className="control-panel">

        <div className="control-heading">
          <div>
            <h2>Backtest Configuration</h2>
            <p>Choose your market and timeframe</p>
          </div>
        </div>

        <div className="controls-grid">

          {/* SYMBOL */}
          <div className="control-group">
            <label>Trading Pair</label>

            <div className="select-wrapper">
              <span className="input-icon">₿</span>

              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              >
                <option value="BTCUSDT">BTC / USDT</option>
                <option value="ETHUSDT">ETH / USDT</option>
                <option value="SOLUSDT">SOL / USDT</option>
                <option value="BNBUSDT">BNB / USDT</option>
                <option value="XRPUSDT">XRP / USDT</option>
                <option value="ADAUSDT">ADA / USDT</option>
                <option value="DOGEUSDT">DOGE / USDT</option>
                <option value="AVAXUSDT">AVAX / USDT</option>
                <option value="LINKUSDT">LINK / USDT</option>
                <option value="DOTUSDT">DOT / USDT</option>
              </select>
            </div>
          </div>

          {/* INTERVAL */}
          <div className="control-group">
            <label>Timeframe</label>

            <div className="select-wrapper">
              <span className="input-icon">◷</span>

              <select
                value={interval}
                onChange={(e) =>
                  setIntervalValue(e.target.value)
                }
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
              </select>
            </div>
          </div>

          {/* BUTTON */}
          <div className="run-control">
            <button
              className="run-button"
              onClick={run}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Running...
                </>
              ) : (
                <>
                  <span>▶</span>
                  Run Backtest
                </>
              )}
            </button>
          </div>

        </div>
      </section>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="loading-card">
          <div className="loading-spinner"></div>

          <div>
            <strong>Running backtest...</strong>
            <span>
              Processing market data and calculating trades
            </span>
          </div>
        </div>
      )}

      {/* ================= RESULTS ================= */}
      {result && (
        <>
          {/* ================= RESULT HEADER ================= */}
          <div className="results-header">

            <div>
              <span className="section-label">BACKTEST RESULTS</span>

              <h2>
                {symbol.replace("USDT", "")}
                <span>/ USDT</span>
              </h2>

              <p>
                Performance analysis for{" "}
                <strong>{interval}</strong> timeframe
              </p>
            </div>

            <div className="balance-display">
              <span>Current Balance</span>

              <strong>
                ${result.balance.toFixed(2)}
              </strong>
            </div>

          </div>

          {/* ================= STATS ================= */}
          <section className="stats-grid">

            {/* BALANCE */}
            <div className="stat-card balance-card">
              <div className="stat-top">
                <span>💰</span>
                <small>ACCOUNT</small>
              </div>

              <div className="stat-value">
                ${result.balance.toFixed(2)}
              </div>

              <div className="stat-description">
                Final balance
              </div>
            </div>

            {/* TOTAL TRADES */}
            <div className="stat-card">
              <div className="stat-top">
                <span>📊</span>
                <small>TRADES</small>
              </div>

              <div className="stat-value">
                {result.stats.total}
              </div>

              <div className="stat-description">
                Total executed trades
              </div>
            </div>

            {/* WINS */}
            <div className="stat-card win-card">
              <div className="stat-top">
                <span>✓</span>
                <small>WINS</small>
              </div>

              <div className="stat-value">
                {result.stats.wins}
              </div>

              <div className="stat-description">
                Successful trades
              </div>
            </div>

            {/* LOSSES */}
            <div className="stat-card loss-card">
              <div className="stat-top">
                <span>×</span>
                <small>LOSSES</small>
              </div>

              <div className="stat-value">
                {result.stats.losses}
              </div>

              <div className="stat-description">
                Losing trades
              </div>
            </div>

            {/* WINRATE */}
            <div className="stat-card winrate-card">
              <div className="stat-top">
                <span>🎯</span>
                <small>WIN RATE</small>
              </div>

              <div className="stat-value">
                {result.stats.winrate}%
              </div>

              <div className="winrate-bar">
                <div
                  style={{
                    width: `${Math.min(
                      Math.max(result.stats.winrate, 0),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* PROFIT PER TRADE */}
            <div className="stat-card">
              <div className="stat-top">
                <span>⚖</span>
                <small>AVG PROFIT</small>
              </div>

              <div
                className={`stat-value ${
                  profitPerTrade >= 0
                    ? "positive"
                    : "negative"
                }`}
              >
                {profitPerTrade >= 0 ? "+" : ""}
                {profitPerTrade.toFixed(2)}$
              </div>

              <div className="stat-description">
                Profit per trade
              </div>
            </div>

          </section>

          {/* ================= TRADES ================= */}
          <section className="trades-section">

            <div className="trades-header">

              <div>
                <span className="section-label">
                  TRADE HISTORY
                </span>

                <h2>Backtest Trades</h2>

                <p>
                  Complete history of simulated trades
                </p>
              </div>

              <div className="trade-count">
                {result.trades.length} Trades
              </div>

            </div>

            <div className="table-container">

              <table className="trades-table">

                <thead>
                  <tr>
                    <th>TYPE</th>
                    <th>ENTRY</th>
                    <th>TAKE PROFIT</th>
                    <th>STATUS</th>
                    <th>PROFIT</th>
                    <th>OPEN TIME</th>
                    <th>CLOSE TIME</th>
                  </tr>
                </thead>

                <tbody>

                  {result.trades.map((t, i) => (
                    <tr key={t.id || i}>

                      <td>
                        <span
                          className={`trade-type ${
                            t.type === "BUY"
                              ? "buy"
                              : "sell"
                          }`}
                        >
                          <span className="trade-dot"></span>
                          {t.type}
                        </span>
                      </td>

                      <td className="price-cell">
                        {t.entry.toFixed(2)}
                      </td>

                      <td className="price-cell">
                        {t.takeProfit.toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={`trade-status ${
                            t.status === "WIN"
                              ? "status-win"
                              : "status-loss"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`profit-value ${
                            t.profit >= 0
                              ? "positive"
                              : "negative"
                          }`}
                        >
                          {t.profit >= 0 ? "+" : ""}
                          {t.profit.toFixed(2)}$
                        </span>
                      </td>

                      <td className="date-cell">
                        {formatDate(t.openTime)}
                      </td>

                      <td className="date-cell">
                        {t.closeTime
                          ? formatDate(t.closeTime)
                          : "-"}
                      </td>

                    </tr>
                  ))}

                  <tr className="total-row">

                    <td colSpan="4">
                      <span>Total Profit</span>
                    </td>

                    <td>
                      <strong
                        className={
                          totalProfit >= 0
                            ? "positive"
                            : "negative"
                        }
                      >
                        {totalProfit >= 0 ? "+" : ""}
                        {totalProfit.toFixed(2)}$
                      </strong>
                    </td>

                    <td colSpan="2"></td>

                  </tr>

                </tbody>

              </table>

            </div>

          </section>
        </>
      )}

      {/* ================= EMPTY STATE ================= */}
      {!result && !loading && (
        <div className="empty-state">

          <div className="empty-icon">
            📈
          </div>

          <h2>Ready to backtest</h2>

          <p>
            Configure your trading pair and timeframe,
            then run your first backtest.
          </p>

        </div>
      )}

      <style>
        {`
/* =========================================================
   BACKTEST PAGE
========================================================= */

.backtest-page {
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(59, 130, 246, 0.08),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 10%,
      rgba(16, 185, 129, 0.06),
      transparent 25%
    ),
    #080c14;

  color: #f8fafc;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  box-sizing: border-box;
}

.backtest-page *,
.backtest-page *::before,
.backtest-page *::after {
  box-sizing: border-box;
}


/* =========================================================
   HEADER
========================================================= */

.backtest-header {
  max-width: 1500px;
  margin: 0 auto 30px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon {
  width: 52px;
  height: 52px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background: linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
  );

  font-size: 24px;

  box-shadow:
    0 10px 30px rgba(37, 99, 235, 0.25);
}

.header-title h1 {
  margin: 0;

  font-size: 25px;
  font-weight: 750;
  letter-spacing: -0.5px;
}

.header-title p {
  margin: 4px 0 0;

  color: #64748b;
  font-size: 13px;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 9px 14px;

  border: 1px solid #1e293b;
  border-radius: 10px;

  background: rgba(15, 23, 42, 0.65);

  color: #64748b;

  font-size: 12px;
}

.header-status strong {
  color: #cbd5e1;
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 10px rgba(34, 197, 94, 0.7);
}


/* =========================================================
   CONTROL PANEL
========================================================= */

.control-panel {
  max-width: 1500px;
  margin: 0 auto 28px;

  padding: 24px;

  border: 1px solid #1e293b;
  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      rgba(15, 23, 42, 0.95),
      rgba(10, 15, 27, 0.95)
    );

  box-shadow:
    0 15px 50px rgba(0, 0, 0, 0.18);
}

.control-heading {
  margin-bottom: 22px;
}

.control-heading h2 {
  margin: 0;

  font-size: 16px;
  font-weight: 650;
}

.control-heading p {
  margin: 5px 0 0;

  color: #64748b;
  font-size: 12px;
}

.controls-grid {
  display: grid;

  grid-template-columns:
    minmax(180px, 1fr)
    minmax(180px, 1fr)
    180px;

  gap: 16px;

  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  color: #94a3b8;

  font-size: 11px;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.input-wrapper,
.select-wrapper {
  position: relative;
}

.input-wrapper input,
.select-wrapper select {
  width: 100%;
  height: 46px;

  padding: 0 14px 0 42px;

  border: 1px solid #263247;
  border-radius: 10px;

  outline: none;

  background: #0b1220;

  color: #f8fafc;

  font-size: 14px;
  font-weight: 600;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-wrapper input:focus,
.select-wrapper select:focus {
  border-color: #3b82f6;

  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-wrapper input::placeholder {
  color: #475569;
}

.input-icon {
  position: absolute;

  left: 14px;
  top: 50%;

  transform: translateY(-50%);

  color: #64748b;

  font-size: 16px;

  pointer-events: none;

  z-index: 2;
}

.select-wrapper select {
  appearance: none;
  cursor: pointer;
}

.run-control {
  display: flex;
}

.run-button {
  width: 100%;
  height: 46px;

  border: 0;
  border-radius: 10px;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #4f46e5
    );

  color: white;

  font-size: 13px;
  font-weight: 700;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 9px;

  box-shadow:
    0 8px 25px rgba(37, 99, 235, 0.22);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.run-button:hover:not(:disabled) {
  transform: translateY(-1px);

  box-shadow:
    0 12px 30px rgba(37, 99, 235, 0.3);
}

.run-button:active:not(:disabled) {
  transform: translateY(0);
}

.run-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}


/* =========================================================
   LOADING
========================================================= */

.loading-card {
  max-width: 1500px;
  margin: 0 auto 28px;

  padding: 17px 20px;

  display: flex;
  align-items: center;

  gap: 14px;

  border: 1px solid #1e3a5f;
  border-radius: 13px;

  background: rgba(15, 35, 60, 0.5);
}

.loading-spinner,
.button-spinner {
  border-radius: 50%;

  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #60a5fa;

  animation: spin 0.8s linear infinite;
}

.loading-spinner {
  width: 25px;
  height: 25px;
}

.button-spinner {
  width: 14px;
  height: 14px;
}

.loading-card strong {
  display: block;

  font-size: 13px;
}

.loading-card span {
  display: block;

  margin-top: 3px;

  color: #64748b;

  font-size: 11px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================================================
   RESULTS HEADER
========================================================= */

.results-header {
  max-width: 1500px;
  margin: 38px auto 20px;

  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  gap: 20px;
}

.section-label {
  display: block;

  margin-bottom: 7px;

  color: #3b82f6;

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 1.5px;
}

.results-header h2 {
  margin: 0;

  font-size: 27px;
  font-weight: 750;

  letter-spacing: -0.7px;
}

.results-header h2 span {
  color: #64748b;

  font-size: 16px;
  font-weight: 500;
}

.results-header p {
  margin: 6px 0 0;

  color: #64748b;

  font-size: 12px;
}

.results-header p strong {
  color: #94a3b8;
}

.balance-display {
  text-align: right;
}

.balance-display span {
  display: block;

  margin-bottom: 4px;

  color: #64748b;

  font-size: 10px;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 1px;
}

.balance-display strong {
  color: #f8fafc;

  font-size: 25px;
  font-weight: 750;
}


/* =========================================================
   STATS
========================================================= */

.stats-grid {
  max-width: 1500px;
  margin: 0 auto 35px;

  display: grid;

  grid-template-columns:
    repeat(6, minmax(0, 1fr));

  gap: 13px;
}

.stat-card {
  min-width: 0;

  padding: 17px;

  border: 1px solid #1e293b;
  border-radius: 14px;

  background:
    linear-gradient(
      145deg,
      rgba(15, 23, 42, 0.9),
      rgba(10, 15, 25, 0.9)
    );

  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  border-color: #334155;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 15px;
}

.stat-top span {
  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: #111827;

  font-size: 14px;
}

.stat-top small {
  color: #475569;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1px;
}

.stat-value {
  color: #f8fafc;

  font-size: 23px;
  font-weight: 750;

  letter-spacing: -0.5px;
}

.stat-description {
  margin-top: 5px;

  color: #64748b;

  font-size: 10px;
}

.positive {
  color: #22c55e !important;
}

.negative {
  color: #ef4444 !important;
}

.win-card {
  border-color: rgba(34, 197, 94, 0.13);
}

.loss-card {
  border-color: rgba(239, 68, 68, 0.13);
}

.winrate-card {
  border-color: rgba(59, 130, 246, 0.13);
}

.winrate-bar {
  width: 100%;
  height: 4px;

  margin-top: 12px;

  overflow: hidden;

  border-radius: 20px;

  background: #172033;
}

.winrate-bar div {
  height: 100%;

  border-radius: inherit;

  background: #3b82f6;

  transition: width 0.5s ease;
}


/* =========================================================
   TRADES SECTION
========================================================= */

.trades-section {
  max-width: 1500px;
  margin: 0 auto;

  overflow: hidden;

  border: 1px solid #1e293b;
  border-radius: 18px;

  background: #0b111d;
}

.trades-header {
  padding: 23px 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #1e293b;
}

.trades-header h2 {
  margin: 0;

  font-size: 18px;
  font-weight: 700;
}

.trades-header p {
  margin: 5px 0 0;

  color: #64748b;

  font-size: 11px;
}

.trade-count {
  padding: 7px 11px;

  border: 1px solid #1e293b;
  border-radius: 8px;

  background: #111827;

  color: #94a3b8;

  font-size: 10px;
  font-weight: 700;
}


/* =========================================================
   TABLE
========================================================= */

.table-container {
  width: 100%;

  overflow-x: auto;
}

.trades-table {
  width: 100%;

  border-collapse: collapse;

  min-width: 900px;
}

.trades-table th {
  height: 45px;

  padding: 0 18px;

  border-bottom: 1px solid #1e293b;

  color: #475569;

  background: #0d1421;

  font-size: 9px;
  font-weight: 800;

  text-align: left;

  letter-spacing: 0.9px;

  white-space: nowrap;
}

.trades-table td {
  height: 57px;

  padding: 0 18px;

  border-bottom: 1px solid #151e2d;

  color: #cbd5e1;

  font-size: 12px;

  white-space: nowrap;
}

.trades-table tbody tr:not(.total-row) {
  transition:
    background 0.15s ease;
}

.trades-table tbody tr:not(.total-row):hover {
  background: rgba(30, 41, 59, 0.35);
}

.trades-table tbody tr:last-child td {
  border-bottom: 0;
}


/* =========================================================
   TRADE TYPE
========================================================= */

.trade-type {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  font-size: 10px;
  font-weight: 800;
}

.trade-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;
}

.trade-type.buy {
  color: #22c55e;
}

.trade-type.buy .trade-dot {
  background: #22c55e;

  box-shadow:
    0 0 8px rgba(34, 197, 94, 0.6);
}

.trade-type.sell {
  color: #ef4444;
}

.trade-type.sell .trade-dot {
  background: #ef4444;

  box-shadow:
    0 0 8px rgba(239, 68, 68, 0.6);
}


/* =========================================================
   PRICE
========================================================= */

.price-cell {
  color: #e2e8f0 !important;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 11px !important;
}


/* =========================================================
   STATUS
========================================================= */

.trade-status {
  display: inline-flex;

  padding: 5px 9px;

  border-radius: 6px;

  font-size: 9px;
  font-weight: 800;
}

.status-win {
  color: #22c55e;

  background: rgba(34, 197, 94, 0.08);

  border: 1px solid rgba(34, 197, 94, 0.13);
}

.status-loss {
  color: #ef4444;

  background: rgba(239, 68, 68, 0.08);

  border: 1px solid rgba(239, 68, 68, 0.13);
}


/* =========================================================
   PROFIT
========================================================= */

.profit-value {
  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 11px;

  font-weight: 700;
}


/* =========================================================
   DATE
========================================================= */

.date-cell {
  color: #64748b !important;

  font-size: 10px !important;
}


/* =========================================================
   TOTAL ROW
========================================================= */

.total-row {
  background:
    linear-gradient(
      90deg,
      #101827,
      #0d1421
    );
}

.total-row td {
  height: 62px;

  color: #94a3b8;

  font-size: 11px;
}

.total-row td:first-child {
  text-align: right;
}

.total-row strong {
  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 13px;
}


/* =========================================================
   EMPTY STATE
========================================================= */

.empty-state {
  max-width: 1500px;
  margin: 80px auto;

  padding: 65px 20px;

  text-align: center;

  border: 1px dashed #263247;
  border-radius: 18px;

  background: rgba(15, 23, 42, 0.35);
}

.empty-icon {
  width: 62px;
  height: 62px;

  margin: 0 auto 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 16px;

  background: #111827;

  font-size: 27px;
}

.empty-state h2 {
  margin: 0;

  font-size: 18px;
}

.empty-state p {
  max-width: 380px;

  margin: 8px auto 0;

  color: #64748b;

  font-size: 12px;

  line-height: 1.6;
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1100px) {

  .backtest-page {
    padding: 24px;
  }

  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .controls-grid {
    grid-template-columns:
      1fr 1fr;
  }

  .run-control {
    grid-column: span 2;
  }

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 700px) {

  .backtest-page {
    padding: 15px;
  }

  .backtest-header {
    align-items: flex-start;
  }

  .header-title {
    gap: 10px;
  }

  .header-icon {
    width: 43px;
    height: 43px;

    border-radius: 11px;

    font-size: 19px;
  }

  .header-title h1 {
    font-size: 20px;
  }

  .header-title p {
    font-size: 11px;
  }

  .header-status {
    display: none;
  }


  /* CONTROLS */

  .control-panel {
    padding: 17px;

    border-radius: 14px;
  }

  .controls-grid {
    grid-template-columns: 1fr;

    gap: 13px;
  }

  .run-control {
    grid-column: auto;
  }


  /* RESULTS */

  .results-header {
    margin-top: 30px;

    align-items: flex-start;

    flex-direction: column;
  }

  .results-header h2 {
    font-size: 23px;
  }

  .balance-display {
    text-align: left;
  }

  .balance-display strong {
    font-size: 22px;
  }


  /* STATS */

  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 10px;

    margin-bottom: 25px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-value {
    font-size: 20px;
  }


  /* TRADES */

  .trades-section {
    border-radius: 14px;
  }

  .trades-header {
    padding: 18px;

    align-items: flex-start;

    gap: 12px;
  }

  .trades-header h2 {
    font-size: 16px;
  }

  .trade-count {
    flex-shrink: 0;
  }

  .table-container {
    overflow-x: auto;

    -webkit-overflow-scrolling: touch;
  }

}


/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 420px) {

  .backtest-page {
    padding: 11px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    min-height: 125px;
  }

  .results-header h2 {
    font-size: 21px;
  }

  .balance-display strong {
    font-size: 20px;
  }

  .empty-state {
    margin-top: 50px;

    padding: 45px 15px;
  }

}
        `}
      </style>

    </div>
  );
}
 

