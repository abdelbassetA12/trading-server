import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE from "../../config/api";

export default function Backtest() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setIntervalValue] = useState("15m");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [liveTrades, setLiveTrades] = useState([]);
  useEffect(() => {
  run(); // 🔥 تشغيل تلقائي عند فتح الصفحة
}, []);

  // ================= BACKTEST =================
  const run = async () => {
  setLoading(true);

  try {
    const response = await fetch(
      `${API_BASE}/replay?symbol=${symbol}&interval=${interval}`
    );

    const data = await response.json();

    console.log("API DATA:", data); // مهم

    setResult(data);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    alert("API ERROR");
  }

  setLoading(false);
};
 



  const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // احترافي
};

  return (
    <div
      style={{
        padding: 20,
        color: "white",
        background: "#0b0f1a",
        minHeight: "100vh",
        fontFamily: "Arial"
      }}
    >
      <h1>📊 Trading Lab</h1>
     

      {/* ================= Controls ================= */}
      <div style={{ marginTop: 20 }}>
   <input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          style={{ marginRight: 10 }}
          
        />

    


        <select
          value={interval}
          onChange={e => setIntervalValue(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
        
        </select>

        <button onClick={run}>🚀 Run Backtest</button>
      </div>

      {/* ================= RESULT ================= */}
      {loading && <p>Running...</p>}

 

      {result && (
        <div
          style={{
            marginTop: 20,
            background: "#020617",
            padding: 15,
            borderRadius: 10
          }}
        >
          <h3>💰 Balance: {result.balance.toFixed(2)}$</h3>
          <p>📊 Total Trades: {result.stats.total}</p>
          <p>✅ Wins: {result.stats.wins}</p>
          <p>❌ Losses: {result.stats.losses}</p>
          <p>📈 Winrate: {result.stats.winrate}%</p>
          <p>
            ⚖️ Profit per Trade:{" "}
            {(
              (result.balance - 1000) /
              (result.stats.total || 1)
            ).toFixed(2)}
            $
          </p>
        </div>
      )}

      {/* ================= BACKTEST TABLE ================= */}
      {result && (
        <>
          <h2 style={{ marginTop: 20 }}>📜 Backtest Trades</h2>

          <table
            style={{
              width: "100%",
              marginTop: 10,
              borderCollapse: "collapse"
            }}
          >
            <thead>
              <tr>
                <th>Type</th>
                <th>Entry</th>
               {/* <th>SL</th>*/}
                <th>TP</th>
                <th>Status</th>
                <th>Profit</th>
                <th>Open Time</th>
                <th>Close Time</th>
              </tr>
            </thead>

            <tbody>
              {result.trades.map((t, i) => {
                
                
             
                return (
                  <tr key={t.id || i}>
                    <td
                      style={{
                        color: t.type === "BUY" ? "lime" : "red"
                      }}
                    >
                      {t.type}
                    </td>

                    <td>{t.entry.toFixed(2)}</td>
                    {/*<td>{t.stopLoss.toFixed(2)}</td>*/}
                    <td>{t.takeProfit.toFixed(2)}</td>

                    <td
                      style={{
                        color: t.status === "WIN" ? "lime" : "red"
                      }}
                    >
                      {t.status}
                    </td>

                    <td
                      style={{
                        color: t.profit > 0 ? "lime" : "red"
                      }}
                    >
                      {t.profit.toFixed(2)}$
                    </td>

                    <td>{formatDate(t.openTime)}</td>
                    <td>{t.closeTime ? formatDate(t.closeTime) : "-"}</td>
                  </tr>
                );
              })}

              {/* ================= TOTAL ROW ================= */}
        <tr
          style={{
            fontWeight: "bold",
            background: "#111428",
            color: "white"
          }}
        >
          <td colSpan={5} style={{ textAlign: "right" }}>
            Total Profit:
          </td>
          <td>
            {result.trades
  .reduce((sum, t) => sum + t.profit, 0)
  .toFixed(2)}
$
            
            
          </td>
          <td colSpan={2}></td>
        </tr>
            </tbody>
          </table>
        </>
      )}

     
     
    </div>
  );
}
