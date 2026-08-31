import { useEffect, useState } from "react";
import API_BASE from "../../config/api";
export default function SignalsPage() {
  const [signals, setSignals] = useState([]);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("15m");
  const [loading, setLoading] = useState(false);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/signals-replay?symbol=${symbol}&interval=${interval}`
      );
      const data = await res.json();
      setSignals(data.signals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const formatDate = (time) => {
    const date = new Date(time);
    return date.toLocaleString();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Signals Replay</h1>

      {/* Controls */}
      <div style={styles.controls}>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          <option>BTCUSDT</option>
          <option>ETHUSDT</option>
          <option>SOLUSDT</option>
          <option>BNBUSDT</option>
          <option>XRPUSDT</option>
          <option>SEIUSDT</option>
          <option>NEARUSDT</option>
        </select>

        <select value={interval} onChange={(e) => setInterval(e.target.value)}>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
        </select>

        <button onClick={fetchSignals}>Load</button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Date</th>
                <th>Price</th>
                <th>SL</th>
                <th>TP</th>
                <th>Frame</th>
              </tr>
            </thead>

            <tbody>
              {signals.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>

                  <td
                    style={{
                      color: s.type === "BUY" ? "lime" : "red",
                      fontWeight: "bold"
                    }}
                  >
                    {s.type}
                  </td>

                  <td>{formatDate(s.time)}</td>
                  <td>{s.price?.toFixed(2)}</td>
                  <td>{s.stopLoss?.toFixed(2)}</td>
                  <td>{s.takeProfit?.toFixed(2)}</td>
                  <td>{interval}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {signals.length === 0 && <p>No signals found</p>}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    color: "white",
    background: "#0f172a",
    minHeight: "100vh"
  },
  title: {
    marginBottom: 20
  },
  controls: {
    display: "flex",
    gap: 10,
    marginBottom: 20
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  }
};