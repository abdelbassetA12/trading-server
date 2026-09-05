 
import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import axios from "axios";
import API_BASE from "../../config/api";
import { useTrading } from "../../hooks/useTrading";
import Controls from "../../components/Controls";
import Portfolio from "../../components/Portfolio";
import { useMarket } from "../../market/hooks/useMarket";
 
export default function TestnetShart() {
  const trading = useTrading();

  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const wsRef = useRef(null);

  const alertLinesRef = useRef([]);
  const candleCloseTimeRef = useRef(0);

  const [symbol, setSymbol] = useState("ETHUSDT");
  const [interval, setIntervalVal] = useState("15m");
  const [lastPrice, setLastPrice] = useState(0);

  const [alerts, setAlerts] = useState([]);
  const [alertPrice, setAlertPrice] = useState("");
  const [countdown, setCountdown] = useState("--");

  const priceLabelRef = useRef(null);
  const entryLineRef = useRef(null);
  const slLineRef = useRef(null);
  const tpLineRef = useRef(null);

  const [openOrders, setOpenOrders] = useState([]);
  const [balances, setBalances] = useState([]);

  const [fromAsset, setFromAsset] = useState("SOL");
  const [toAsset, setToAsset] = useState("USDT");
  const [amount, setAmount] = useState("");

  const [signals, setSignals] = useState([]);
  const [selected, setSelected] = useState("BTCUSDT");

  const [binanceTrades, setBinanceTrades] = useState([]);

  const ordersLinesRef = useRef([]);

  const [editModal, setEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  function getSignalStyle(signal) {
    if (signal.includes("BUY")) return { color: "#22c55e" };
    if (signal.includes("SELL")) return { color: "#ef4444" };
    return { color: "#fbbf24" };
  }

  const { data } = useMarket("crypto", symbol, interval);

  useEffect(() => {
    if (!candleSeriesRef.current || data.length === 0) return;

    candleSeriesRef.current.setData(data);
  }, [data]);

  function drawTrade(position) {
    clearTradeLines();

    if (!position) return;

    const { entry, sl, tp, type } = position;

    entryLineRef.current =
      candleSeriesRef.current.createPriceLine({
        price: entry,
        color: "#22c55e",
        lineWidth: 2,
        axisLabelVisible: true,
        title: type.toUpperCase(),
      });

    if (sl) {
      slLineRef.current =
        candleSeriesRef.current.createPriceLine({
          price: sl,
          color: "#ef4444",
          lineWidth: 2,
          axisLabelVisible: true,
          title: "SL",
        });
    }

    if (tp) {
      tpLineRef.current =
        candleSeriesRef.current.createPriceLine({
          price: tp,
          color: "#3b82f6",
          lineWidth: 2,
          axisLabelVisible: true,
          title: "TP",
        });
    }
  }

  function clearTradeLines() {
    if (entryLineRef.current) {
      candleSeriesRef.current.removePriceLine(
        entryLineRef.current
      );

      entryLineRef.current = null;
    }

    if (slLineRef.current) {
      candleSeriesRef.current.removePriceLine(
        slLineRef.current
      );

      slLineRef.current = null;
    }

    if (tpLineRef.current) {
      candleSeriesRef.current.removePriceLine(
        tpLineRef.current
      );

      tpLineRef.current = null;
    }
  }

  useEffect(() => {
    if (trading.position) {
      drawTrade(trading.position);
    } else {
      clearTradeLines();
    }
  }, [trading.position]);

  /* ================= INIT ================= */

  useEffect(() => {
    if (chartRef.current) return;

    const chart = createChart(
      document.getElementById("chart"),
      {
        width: window.innerWidth * 0.75,
        height: window.innerHeight - 50,

        layout: {
          background: { color: "#080c14" },
          textColor: "#94a3b8",
        },

        grid: {
          vertLines: {
            color: "#151e2d",
          },

          horzLines: {
            color: "#151e2d",
          },
        },
      }
    );

    chartRef.current = chart;

    candleSeriesRef.current =
      chart.addCandlestickSeries();

    candleSeriesRef.current.applyOptions({});

    connect(symbol, interval);

    startCountdown();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);

      wsRef.current?.close();
    };
  }, []);

  /* ================= RESIZE ================= */

  function resize() {
    chartRef.current?.applyOptions({
      width: window.innerWidth * 0.75,
      height: window.innerHeight - 50,
    });
  }

  /* ================= SYMBOL / INTERVAL ================= */

  useEffect(() => {
    if (!candleSeriesRef.current) return;

    connect(symbol, interval);
  }, [symbol, interval]);

  /* ================= WS ================= */

  function connect(sym, intv) {
    wsRef.current?.close();

    wsRef.current = new WebSocket(
      `wss://stream.binance.com:9443/ws/${sym.toLowerCase()}@kline_${intv}`
    );

    wsRef.current.onmessage = (e) => {
      const k = JSON.parse(e.data).k;

      const candle = {
        time: Math.floor(k.t / 1000),
        open: +k.o,
        high: +k.h,
        low: +k.l,
        close: +k.c,
      };

      candleSeriesRef.current?.update(candle);

      lastPriceRef(candle.close);

      candleCloseTimeRef.current =
        Math.floor(k.T / 1000);

      updatePriceLabel(candle.close);

      checkAlerts(candle.close);

      trading.update(candle.close);
    };
  }

  function lastPriceRef(price) {
    setLastPrice(price);
  }

  /* ================= ALERT ================= */

  function setAlert() {
    const price = parseFloat(alertPrice);

    if (!price) return;

    setAlerts((p) => [...p, price]);

    const line =
      candleSeriesRef.current.createPriceLine({
        price,
        color: "#f59e0b",
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "ALERT",
      });

    alertLinesRef.current.push(line);

    setAlertPrice("");
  }

  function checkAlerts(price) {
    setAlerts((prev) =>
      prev.filter((a) => {
        if (price >= a) {
          alert("🚨 Price hit: " + a);
          return false;
        }

        return true;
      })
    );
  }

  /* ================= PRICE LABEL ================= */

  function updatePriceLabel(price) {
    if (!price) return;

    const y =
      candleSeriesRef.current?.priceToCoordinate(price) ??
      100;

    const now = Math.floor(Date.now() / 1000);

    let remaining =
      candleCloseTimeRef.current - now;

    if (remaining < 0) remaining = 0;

    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;

    const el = priceLabelRef.current;

    if (!el) return;

    el.style.top = y + "px";

    el.innerHTML = `
      <div class="price-label-countdown">
        ${min}:${sec.toString().padStart(2, "0")}
      </div>
    `;
  }

  /* ================= COUNTDOWN ================= */

  function startCountdown() {
    setInterval(() => {
      const now = Math.floor(Date.now() / 1000);

      let remaining =
        candleCloseTimeRef.current - now;

      if (remaining < 0) remaining = 0;

      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;

      setCountdown(
        `${min}:${sec.toString().padStart(2, "0")}`
      );

      updatePriceLabel(lastPrice);
    }, 1000);
  }

  /* =========================================================
     TESTNET
  ========================================================= */

  const fetchOpenOrders = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/testnet/open-orders`
      );

      setOpenOrders(res.data);
    } catch (err) {
      console.error(
        "Error fetching open orders:",
        err
      );
    }
  };

  useEffect(() => {
    fetchOpenOrders();

    const interval = setInterval(
      fetchOpenOrders,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  /* ================= BALANCES ================= */

  const fetchBalances = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/testnet/balance`
      );

      const data = await res.json();

      const filtered = data.filter((b) =>
        ["USDT", "BTC", "ETH", "SOL"].includes(
          b.asset
        )
      );

      setBalances(filtered);
    } catch (err) {
      console.error(
        "Error fetching balances:",
        err
      );
    }
  };

  useEffect(() => {
    fetchBalances();

    const interval = setInterval(
      fetchBalances,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  /* ================= CANCEL ORDER ================= */

  const cancel = async (symbol, orderId) => {
    try {
      await axios.delete(
        `${API_BASE}/api/testnet/cancel-order`,
        {
          data: {
            symbol,
            orderId,
          },
        }
      );

      alert("✅ Order Cancelled");

      fetchOpenOrders();
    } catch (err) {
      console.error(
        err.response?.data || err.message
      );

      alert("❌ Cancel Failed");
    }
  };

  /* ================= CONVERT ================= */

  const convert = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/convert`,
        {
          fromAsset,
          toAsset,
          amount: parseFloat(amount),
        }
      );

      alert("✅ Conversion Done");

      console.log(res.data);
    } catch (err) {
      console.error(
        err.response?.data || err.message
      );

      alert("❌ Conversion Failed");
    }
  };

  /* ================= SIGNALS ================= */

  const loadSignals = async () => {
    const res = await axios.get(
      `${API_BASE}/signals`
    );

    setSignals(res.data);
  };

  useEffect(() => {
    loadSignals();

    const i = setInterval(
      loadSignals,
      30000
    );

    return () => clearInterval(i);
  }, []);

  /* ================= BINANCE TRADES ================= */

  const fetchBinanceTrades = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/testnet/trades-all`
      );

      const data = await res.json();

      setBinanceTrades(data);
    } catch (err) {
      console.error(
        "Error fetching binance trades:",
        err
      );
    }
  };

  useEffect(() => {
    fetchBinanceTrades();

    const interval = setInterval(
      fetchBinanceTrades,
       30000
    );

    return () => clearInterval(interval);
  }, []);

  function formatDate(time) {
    const d = new Date(time);

    return d.toLocaleString();
  }

  /* ================= OPEN ORDER LINES ================= */

  function drawOpenOrders(orders) {
    ordersLinesRef.current.forEach((line) => {
      candleSeriesRef.current.removePriceLine(
        line
      );
    });

    ordersLinesRef.current = [];

    if (!orders || orders.length === 0) return;

    orders.forEach((order) => {
      const price = parseFloat(order.price);

      if (!price || price === 0) return;

      const isBuy = order.side === "BUY";

      const line =
        candleSeriesRef.current.createPriceLine({
          price,

          color: isBuy
            ? "#22c55e"
            : "#ef4444",

          lineWidth: 2,

          lineStyle: 0,

          axisLabelVisible: true,

          title: `${order.side} (${order.type}) ${order.origQty}`,
        });

      ordersLinesRef.current.push(line);
    });
  }

  useEffect(() => {
    if (!candleSeriesRef.current) return;

    drawOpenOrders(openOrders);
  }, [openOrders]);

  /* ================= MODIFY ORDER ================= */

  const handleUpdateOrder = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/testnet/modify-order`,
        {
          symbol: selectedOrder.symbol,
          orderId: selectedOrder.orderId,
          price: parseFloat(newPrice),
          quantity: selectedOrder.origQty,
          side: selectedOrder.side,
        }
      );

      setEditModal(false);
      setSelectedOrder(null);

      fetchOpenOrders();
    } catch (err) {
      console.error(
        err.response?.data || err.message
      );
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="trading-dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="dashboard-header">

        <div className="brand-area">

          <div className="brand-icon">
            ₿
          </div>

          <div>
            <h1>Testnet Trading</h1>

            <p>
              Binance simulated trading terminal
            </p>
          </div>

        </div>

        <div className="market-status">

          <span className="online-dot"></span>

          <span>Market</span>

          <strong>LIVE</strong>

        </div>

      </header>


      {/* =====================================================
          MARKET CONTROL BAR
      ===================================================== */}

      <section className="market-toolbar">

        <div className="toolbar-symbol">

          <span className="toolbar-label">
            MARKET
          </span>

          <select
            value={symbol}
            onChange={(e) =>
              setSymbol(e.target.value)
            }
          >
            <option>BTCUSDT</option>
            <option>ETHUSDT</option>
            <option>SOLUSDT</option>
          </select>

        </div>

        <div className="toolbar-timeframe">

          <span className="toolbar-label">
            TIMEFRAME
          </span>

          <select
            value={interval}
            onChange={(e) =>
              setIntervalVal(e.target.value)
            }
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
          </select>

        </div>

        <div className="current-price">

          <span>LAST PRICE</span>

          <strong>
            {lastPrice
              ? lastPrice.toFixed(2)
              : "--"}
          </strong>

          <small>USDT</small>

        </div>

        <div className="candle-timer">

          <span>CANDLE CLOSE</span>

          <strong>{countdown}</strong>

        </div>

        <div className="alert-control">

          <input
            value={alertPrice}
            onChange={(e) =>
              setAlertPrice(e.target.value)
            }
            placeholder="Alert price"
            type="number"
          />

          <button onClick={setAlert}>
            🔔 Set Alert
          </button>

        </div>

      </section>


      {/* =====================================================
          MAIN TERMINAL
      ===================================================== */}

      <main className="terminal-layout">

        {/* ================= CHART ================= */}

        <section className="chart-panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                PRICE ACTION
              </span>

              <h2>
                {symbol}
                <span> / USDT</span>
              </h2>

            </div>

            <div className="chart-live">

              <span></span>

              Live market data

            </div>

          </div>

          <div
            id="chart"
            className="chart-container"
          >

            <div
              ref={priceLabelRef}
              className="price-floating-label"
            />

          </div>

        </section>


        {/* ================= SIDE PANEL ================= */}

        <aside className="trading-sidebar">

          <div className="sidebar-section">

            <div className="sidebar-title">
              <span>⚡</span>
              Trading
            </div>

            <Controls
              price={lastPrice}
              openLong={trading.openLong}
              openShort={trading.openShort}
            />

          </div>


          <div className="sidebar-section">

            <div className="sidebar-title">
              <span>💼</span>
              Portfolio
            </div>

            <Portfolio
              balance={trading.balance}
              pnl={trading.pnl}
              position={trading.position}
            />

          </div>


          <div className="sidebar-section alerts-panel">

            <div className="sidebar-title">

              <span>🔔</span>

              Price Alerts

              <span className="badge-count">
                {alerts.length}
              </span>

            </div>

            <div className="alerts-list">

              {alerts.length === 0 ? (

                <div className="no-alerts">
                  No active alerts
                </div>

              ) : (

                alerts.map((a, i) => (

                  <div
                    className="alert-item"
                    key={i}
                  >
                    <span className="alert-dot"></span>

                    <span>
                      Alert @ {a}
                    </span>

                  </div>

                ))

              )}

            </div>

          </div>

        </aside>

      </main>


      {/* =====================================================
          DATA SECTION
      ===================================================== */}

      <section className="data-area">


        {/* =================================================
            BALANCES
        ================================================= */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <span className="card-kicker">
                ACCOUNT
              </span>

              <h2>Wallet Balances</h2>

              <p>
                Available assets in your testnet account
              </p>
            </div>

            <span className="live-badge">
              ● LIVE
            </span>

          </div>

          <div className="balance-grid">

            {balances.map((b, i) => (

              <div
                className="balance-card"
                key={i}
              >

                <div className="asset-symbol">
                  {b.asset}
                </div>

                <div className="asset-info">

                  <span>Available</span>

                  <strong>
                    {b.free}
                  </strong>

                </div>

                <div className="asset-locked">

                  <span>Locked</span>

                  <strong>
                    {b.locked}
                  </strong>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* =================================================
            CONVERTER
        ================================================= */}

        <div className="dashboard-card converter-card">

          <div className="card-header">

            <div>
              <span className="card-kicker">
                ASSET MANAGEMENT
              </span>

              <h2>Convert Assets</h2>

              <p>
                Convert one testnet asset into another
              </p>
            </div>

            <span className="converter-icon">
              ⇄
            </span>

          </div>

          <div className="converter-form">

            <div className="asset-input">

              <label>FROM</label>

              <select
                value={fromAsset}
                onChange={(e) =>
                  setFromAsset(e.target.value)
                }
              >
                <option>USDT</option>
                <option>SOL</option>
                <option>BTC</option>
                <option>ETH</option>
                <option>SEI</option>
              </select>

            </div>

            <div className="swap-arrow">
              →
            </div>

            <div className="asset-input">

              <label>TO</label>

              <select
                value={toAsset}
                onChange={(e) =>
                  setToAsset(e.target.value)
                }
              >
                <option>USDT</option>
                <option>SOL</option>
                <option>BTC</option>
                <option>ETH</option>
                <option>SEI</option>
              </select>

            </div>

            <div className="asset-input amount-input">

              <label>AMOUNT</label>

              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

            </div>

            <button
              className="convert-button"
              onClick={convert}
            >
              Convert Asset
            </button>

          </div>

        </div>


        {/* =================================================
            MARKET SIGNALS
        ================================================= */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <span className="card-kicker">
                MARKET INTELLIGENCE
              </span>

              <h2>Market Overview</h2>

              <p>
                Current strategy signals and trade levels
              </p>

            </div>

            <span className="live-badge">
              ● AUTO UPDATE
            </span>

          </div>

          <div className="responsive-table">

            <table className="modern-table">

              <thead>

                <tr>
                  <th>COIN</th>
                  <th>SIGNAL</th>
                  <th>SCORE</th>
                  <th>VOLUME</th>
                  <th>ENTRY</th>
                  <th>SL</th>
                  <th>TP</th>
                </tr>

              </thead>

              <tbody>

                {signals.map((s, i) => (

                  <tr
                    key={i}
                    onClick={() =>
                      setSelected(s.symbol)
                    }
                    className={
                      selected === s.symbol
                        ? "selected-row"
                        : ""
                    }
                  >

                    <td>
                      <strong className="coin-name">
                        {s.symbol}
                      </strong>
                    </td>

                    <td>
                      <span
                        className="signal-badge"
                        style={getSignalStyle(
                          s.signal
                        )}
                      >
                        {s.signal}
                      </span>
                    </td>

                    <td>
                      <span className="score-value">
                        {s.score}
                      </span>
                    </td>

                    <td>
                      {s.volume}x
                    </td>

                    <td>
                      {s.trade?.entry?.toFixed(2) ||
                        "-"}
                    </td>

                    <td className="sl-value">
                      {s.trade?.stopLoss?.toFixed(
                        2
                      ) || "-"}
                    </td>

                    <td className="tp-value">
                      {s.trade?.takeProfit?.toFixed(
                        2
                      ) || "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            OPEN ORDERS
        ================================================= */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <span className="card-kicker">
                BINANCE TESTNET
              </span>

              <h2>Open Orders</h2>

              <p>
                Active orders currently placed on Binance
              </p>

            </div>

            <span className="orders-count">
              {openOrders.length} ACTIVE
            </span>

          </div>

          {openOrders.length === 0 ? (

            <div className="empty-table">

              <div className="empty-icon">
                ◌
              </div>

              <strong>
                No open orders
              </strong>

              <span>
                Your active Binance orders will appear here.
              </span>

            </div>

          ) : (

            <div className="responsive-table">

              <table className="modern-table">

                <thead>

                  <tr>
                    <th>SYMBOL</th>
                    <th>SIDE</th>
                    <th>TYPE</th>
                    <th>PRICE</th>
                    <th>QUANTITY</th>
                    <th>STATUS</th>
                    <th>CANCEL</th>
                    <th>EDIT</th>
                  </tr>

                </thead>

                <tbody>

                  {openOrders.map((o, i) => (

                    <tr key={i}>

                      <td>
                        <strong>
                          {o.symbol}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`side-badge ${
                            o.side === "BUY"
                              ? "buy-side"
                              : "sell-side"
                          }`}
                        >
                          {o.side}
                        </span>
                      </td>

                      <td>
                        {o.type}
                      </td>

                      <td className="number-cell">
                        {o.price}
                      </td>

                      <td className="number-cell">
                        {o.origQty}
                      </td>

                      <td>
                        <span className="pending-status">
                          {o.status}
                        </span>
                      </td>

                      <td>

                        <button
                          className="danger-button"
                          onClick={() =>
                            cancel(
                              o.symbol,
                              o.orderId
                            )
                          }
                        >
                          Cancel
                        </button>

                      </td>

                      <td>

                        <button
                          className="edit-button"
                          onClick={() => {
                            setSelectedOrder(o);
                            setNewPrice(o.price);
                            setEditModal(true);
                          }}
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =================================================
            REAL BINANCE TRADES
        ================================================= */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <span className="card-kicker">
                EXECUTION HISTORY
              </span>

              <h2>Binance Real Trades</h2>

              <p>
                Completed trades from your testnet account
              </p>

            </div>

            <span className="live-badge">
              ● LIVE
            </span>

          </div>

          {binanceTrades.length === 0 ? (

            <div className="empty-table">

              <div className="empty-icon">
                📊
              </div>

              <strong>
                No Binance trades yet
              </strong>

              <span>
                Completed trades will appear here.
              </span>

            </div>

          ) : (

            <div className="responsive-table">

              <table className="modern-table">

                <thead>

                  <tr>
                    <th>SYMBOL</th>
                    <th>QTY</th>
                    <th>ENTRY</th>
                    <th>EXIT</th>
                    <th>PROFIT</th>
                    <th>ENTRY TIME</th>
                    <th>EXIT TIME</th>
                    <th>DURATION</th>
                    <th>STATUS</th>
                    <th>RESULT</th>
                  </tr>

                </thead>

                <tbody>

                  {binanceTrades.map((t, i) => (

                    <tr key={i}>

                      <td>
                        <strong>
                          {t.symbol}
                        </strong>
                      </td>

                      <td>
                        {t.qty}
                      </td>

                      <td>
                        {t.entry?.toFixed(2)}
                      </td>

                      <td>
                        {t.exit?.toFixed(2)}
                      </td>

                      <td>

                        <span
                          className={
                            t.profit > 0
                              ? "profit-positive"
                              : "profit-negative"
                          }
                        >
                          {t.profit?.toFixed(2)}
                        </span>

                      </td>

                      <td className="date-cell">
                        {formatDate(
                          t.entryTime
                        )}
                      </td>

                      <td className="date-cell">
                        {formatDate(
                          t.exitTime
                        )}
                      </td>

                      <td>
                        {t.duration} min
                      </td>

                      <td>
                        <span className="trade-status">
                          {t.status}
                        </span>
                      </td>

                      <td>
                        {t.result}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          EDIT ORDER MODAL
      ===================================================== */}

      {editModal && selectedOrder && (

        <div className="modal-overlay">

          <div className="edit-modal">

            <button
              className="modal-close"
              onClick={() =>
                setEditModal(false)
              }
            >
              ×
            </button>

            <div className="modal-icon">
              ✎
            </div>

            <span className="modal-kicker">
              ORDER MANAGEMENT
            </span>

            <h2>
              Edit Order
            </h2>

            <p className="modal-description">
              Update the price of your active order.
            </p>

            <div className="order-summary">

              <div>
                <span>SYMBOL</span>
                <strong>
                  {selectedOrder.symbol}
                </strong>
              </div>

              <div>
                <span>SIDE</span>

                <strong
                  className={
                    selectedOrder.side === "BUY"
                      ? "buy-text"
                      : "sell-text"
                  }
                >
                  {selectedOrder.side}
                </strong>
              </div>

              <div>
                <span>QUANTITY</span>
                <strong>
                  {selectedOrder.origQty}
                </strong>
              </div>

            </div>

            <div className="modal-input">

              <label>
                NEW PRICE
              </label>

              <input
                type="number"
                value={newPrice}
                onChange={(e) =>
                  setNewPrice(
                    e.target.value
                  )
                }
                placeholder="Enter new price"
              />

            </div>

            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={() =>
                  setEditModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="modal-save"
                onClick={handleUpdateOrder}
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

      <style>
        {`
      
/* =========================================================
   TESTNET TRADING DASHBOARD
========================================================= */

.trading-dashboard {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(37, 99, 235, 0.08),
      transparent 25%
    ),
    radial-gradient(
      circle at 90% 0%,
      rgba(16, 185, 129, 0.05),
      transparent 22%
    ),
    #070b12;

  color: #e5e7eb;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  padding: 0 24px 50px;
}

.trading-dashboard *,
.trading-dashboard *::before,
.trading-dashboard *::after {
  box-sizing: border-box;
}


/* =========================================================
   HEADER
========================================================= */

.dashboard-header {
  max-width: 1600px;

  margin: 0 auto;

  min-height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #182231;
}

.brand-area {
  display: flex;
  align-items: center;

  gap: 13px;
}

.brand-icon {
  width: 43px;
  height: 43px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #4f46e5
    );

  color: white;

  font-size: 21px;
  font-weight: 800;

  box-shadow:
    0 8px 25px rgba(37, 99, 235, 0.2);
}

.brand-area h1 {
  margin: 0;

  color: #f8fafc;

  font-size: 18px;
  font-weight: 750;
}

.brand-area p {
  margin: 3px 0 0;

  color: #64748b;

  font-size: 10px;
}

.market-status {
  display: flex;
  align-items: center;
  gap: 7px;

  padding: 8px 12px;

  border: 1px solid #1d2939;

  border-radius: 8px;

  background: #0c121d;

  color: #64748b;

  font-size: 10px;
}

.market-status strong {
  color: #22c55e;

  font-size: 9px;
}

.online-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 9px rgba(34, 197, 94, 0.8);
}


/* =========================================================
   MARKET TOOLBAR
========================================================= */

.market-toolbar {
  max-width: 1600px;

  margin: 16px auto;

  padding: 13px;

  display: flex;
  align-items: center;

  gap: 12px;

  border: 1px solid #1b2737;

  border-radius: 13px;

  background:
    rgba(11, 18, 30, 0.9);

  box-shadow:
    0 10px 35px rgba(0, 0, 0, 0.12);
}

.toolbar-symbol,
.toolbar-timeframe {
  display: flex;
  align-items: center;

  gap: 8px;

  padding-right: 13px;

  border-right: 1px solid #1e293b;
}

.toolbar-label {
  color: #475569;

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 1px;
}

.market-toolbar select,
.market-toolbar input {
  height: 34px;

  border: 1px solid #263447;
  border-radius: 7px;

  outline: none;

  background: #0c1421;

  color: #e2e8f0;

  padding: 0 10px;

  font-size: 11px;
  font-weight: 600;
}

.market-toolbar select:focus,
.market-toolbar input:focus {
  border-color: #3b82f6;
}

.current-price {
  display: flex;
  align-items: center;

  gap: 7px;

  padding-left: 3px;
}

.current-price span,
.candle-timer span {
  color: #475569;

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 0.8px;
}

.current-price strong {
  color: #f8fafc;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 15px;
}

.current-price small {
  color: #64748b;

  font-size: 8px;
}

.candle-timer {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-left: auto;

  padding: 0 14px;

  border-left: 1px solid #1e293b;
}

.candle-timer strong {
  color: #f59e0b;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 12px;
}

.alert-control {
  display: flex;

  gap: 7px;
}

.alert-control input {
  width: 120px;
}

.alert-control button {
  height: 34px;

  padding: 0 13px;

  border: 1px solid #61451a;
  border-radius: 7px;

  background: rgba(245, 158, 11, 0.08);

  color: #fbbf24;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.alert-control button:hover {
  background: rgba(245, 158, 11, 0.14);

  transform: translateY(-1px);
}


/* =========================================================
   TERMINAL
========================================================= */

.terminal-layout {
  max-width: 1600px;

  margin: 0 auto 22px;

  display: grid;

  grid-template-columns:
    minmax(0, 3.5fr)
    minmax(280px, 1fr);

  gap: 14px;
}

.chart-panel {
  min-width: 0;

  overflow: hidden;

  border: 1px solid #1b2737;

  border-radius: 14px;

  background: #0a101a;
}

.panel-header {
  height: 58px;

  padding: 0 18px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #182231;
}

.panel-kicker,
.card-kicker {
  display: block;

  margin-bottom: 3px;

  color: #3b82f6;

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 1.2px;
}

.panel-header h2 {
  margin: 0;

  font-size: 16px;
  font-weight: 750;
}

.panel-header h2 span {
  color: #475569;

  font-size: 11px;
  font-weight: 500;
}

.chart-live {
  display: flex;
  align-items: center;

  gap: 6px;

  color: #64748b;

  font-size: 9px;
}

.chart-live span {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 7px rgba(34, 197, 94, 0.8);
}

.chart-container {
  position: relative;

  width: 100%;

  height: 650px;
}

.price-floating-label {
  position: absolute;

  right: 0;

  transform: translateY(-50%);

  z-index: 20;

  pointer-events: none;
}

.price-label-countdown {
  padding: 4px 8px;

  border: 1px solid #334155;

  border-radius: 5px;

  background: #111827;

  color: #9ca3af;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 9px;
}


/* =========================================================
   SIDEBAR
========================================================= */

.trading-sidebar {
  display: flex;

  flex-direction: column;

  gap: 12px;

  min-width: 0;
}

.sidebar-section {
  padding: 15px;

  border: 1px solid #1b2737;

  border-radius: 13px;

  background: #0b121d;
}

.sidebar-title {
  display: flex;
  align-items: center;

  gap: 8px;

  padding-bottom: 12px;

  margin-bottom: 13px;

  border-bottom: 1px solid #182231;

  color: #e2e8f0;

  font-size: 12px;
  font-weight: 700;
}

.sidebar-title > span:first-child {
  width: 27px;
  height: 27px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background: #111b2a;

  font-size: 12px;
}

.badge-count {
  margin-left: auto;

  min-width: 20px;
  height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 5px;

  background: #172033;

  color: #94a3b8;

  font-size: 9px;
}


/* =========================================================
   ALERTS
========================================================= */

.alerts-list {
  display: flex;

  flex-direction: column;

  gap: 6px;
}

.no-alerts {
  padding: 15px;

  text-align: center;

  color: #475569;

  font-size: 10px;
}

.alert-item {
  padding: 9px 10px;

  display: flex;
  align-items: center;

  gap: 8px;

  border: 1px solid #2d2616;

  border-radius: 7px;

  background: rgba(245, 158, 11, 0.04);

  color: #fbbf24;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 10px;
}

.alert-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #f59e0b;
}


/* =========================================================
   DATA AREA
========================================================= */

.data-area {
  max-width: 1600px;

  margin: 0 auto;

  display: flex;

  flex-direction: column;

  gap: 14px;
}

.dashboard-card {
  overflow: hidden;

  border: 1px solid #1b2737;

  border-radius: 14px;

  background: #0b121d;
}

.card-header {
  padding: 20px 20px 17px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 15px;

  border-bottom: 1px solid #182231;
}

.card-header h2 {
  margin: 0;

  color: #f1f5f9;

  font-size: 16px;
  font-weight: 750;
}

.card-header p {
  margin: 5px 0 0;

  color: #64748b;

  font-size: 10px;
}

.live-badge,
.orders-count {
  padding: 6px 9px;

  border: 1px solid #173823;

  border-radius: 6px;

  background: rgba(34, 197, 94, 0.05);

  color: #22c55e;

  font-size: 8px;
  font-weight: 800;

  white-space: nowrap;
}

.orders-count {
  border-color: #24344a;

  background: #101927;

  color: #64748b;
}


/* =========================================================
   BALANCES
========================================================= */

.balance-grid {
  padding: 15px;

  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 10px;
}

.balance-card {
  padding: 15px;

  border: 1px solid #1b293a;

  border-radius: 10px;

  background:
    linear-gradient(
      145deg,
      #0f1826,
      #0c131e
    );

  display: grid;

  grid-template-columns: auto 1fr 1fr;

  align-items: center;

  gap: 12px;
}

.asset-symbol {
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: #172235;

  color: #e2e8f0;

  font-size: 10px;
  font-weight: 800;
}

.asset-info,
.asset-locked {
  display: flex;
  flex-direction: column;

  gap: 4px;
}

.asset-info span,
.asset-locked span {
  color: #475569;

  font-size: 8px;
  text-transform: uppercase;

  letter-spacing: 0.6px;
}

.asset-info strong {
  color: #f8fafc;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 11px;
}

.asset-locked strong {
  color: #64748b;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 10px;
}


/* =========================================================
   CONVERTER
========================================================= */

.converter-form {
  padding: 17px;

  display: grid;

  grid-template-columns:
    1fr 30px 1fr 1fr auto;

  gap: 10px;

  align-items: end;
}

.asset-input {
  display: flex;
  flex-direction: column;

  gap: 6px;
}

.asset-input label {
  color: #475569;

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 0.8px;
}

.asset-input select,
.asset-input input {
  width: 100%;
  height: 40px;

  padding: 0 11px;

  border: 1px solid #263447;

  border-radius: 8px;

  outline: none;

  background: #0c1421;

  color: #e2e8f0;

  font-size: 11px;
  font-weight: 600;
}

.asset-input select:focus,
.asset-input input:focus {
  border-color: #3b82f6;
}

.swap-arrow {
  width: 30px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #64748b;

  font-size: 17px;
}

.convert-button {
  height: 40px;

  padding: 0 17px;

  border: 0;

  border-radius: 8px;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #4f46e5
    );

  color: white;

  font-size: 10px;
  font-weight: 750;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.convert-button:hover {
  transform: translateY(-1px);

  box-shadow:
    0 8px 22px rgba(37, 99, 235, 0.2);
}


/* =========================================================
   TABLE
========================================================= */

.responsive-table {
  width: 100%;

  overflow-x: auto;

  -webkit-overflow-scrolling: touch;
}

.modern-table {
  width: 100%;

  min-width: 900px;

  border-collapse: collapse;
}

.modern-table th {
  height: 43px;

  padding: 0 18px;

  background: #0d1521;

  border-bottom: 1px solid #1b2737;

  color: #475569;

  text-align: left;

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 0.9px;

  white-space: nowrap;
}

.modern-table td {
  height: 53px;

  padding: 0 18px;

  border-bottom: 1px solid #151f2e;

  color: #94a3b8;

  font-size: 10px;

  white-space: nowrap;
}

.modern-table tbody tr {
  transition:
    background 0.15s ease;
}

.modern-table tbody tr:hover {
  background: rgba(30, 41, 59, 0.3);
}

.modern-table tbody tr:last-child td {
  border-bottom: 0;
}

.selected-row {
  background:
    rgba(37, 99, 235, 0.07) !important;
}

.coin-name {
  color: #e2e8f0;

  font-size: 11px;
}

.signal-badge {
  font-size: 9px;
  font-weight: 800;
}

.score-value {
  color: #e2e8f0;

  font-weight: 700;
}

.sl-value {
  color: #ef4444 !important;
}

.tp-value {
  color: #3b82f6 !important;
}

.number-cell {
  color: #cbd5e1 !important;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;
}


/* =========================================================
   ORDER BADGES
========================================================= */

.side-badge {
  display: inline-flex;

  padding: 5px 8px;

  border-radius: 5px;

  font-size: 8px;
  font-weight: 800;
}

.buy-side {
  color: #22c55e;

  background: rgba(34, 197, 94, 0.08);

  border: 1px solid rgba(34, 197, 94, 0.14);
}

.sell-side {
  color: #ef4444;

  background: rgba(239, 68, 68, 0.08);

  border: 1px solid rgba(239, 68, 68, 0.14);
}

.pending-status {
  color: #f59e0b;

  font-size: 9px;
  font-weight: 700;
}


/* =========================================================
   ACTION BUTTONS
========================================================= */

.danger-button,
.edit-button {
  height: 29px;

  padding: 0 10px;

  border-radius: 6px;

  font-size: 9px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.danger-button {
  border: 1px solid #4c2025;

  background: rgba(239, 68, 68, 0.06);

  color: #ef4444;
}

.edit-button {
  border: 1px solid #203c67;

  background: rgba(59, 130, 246, 0.06);

  color: #60a5fa;
}

.danger-button:hover,
.edit-button:hover {
  transform: translateY(-1px);
}

.danger-button:hover {
  background: rgba(239, 68, 68, 0.12);
}

.edit-button:hover {
  background: rgba(59, 130, 246, 0.12);
}


/* =========================================================
   TRADES
========================================================= */

.profit-positive {
  color: #22c55e;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-weight: 700;
}

.profit-negative {
  color: #ef4444;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-weight: 700;
}

.date-cell {
  color: #64748b !important;

  font-size: 9px !important;
}

.trade-status {
  padding: 5px 8px;

  border: 1px solid #263247;

  border-radius: 5px;

  background: #111827;

  color: #94a3b8;

  font-size: 8px;
  font-weight: 700;
}


/* =========================================================
   EMPTY
========================================================= */

.empty-table {
  padding: 45px 20px;

  display: flex;
  align-items: center;
  flex-direction: column;

  gap: 6px;

  text-align: center;
}

.empty-icon {
  width: 42px;
  height: 42px;

  margin-bottom: 5px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #111b2a;

  color: #475569;

  font-size: 17px;
}

.empty-table strong {
  color: #cbd5e1;

  font-size: 11px;
}

.empty-table span {
  color: #475569;

  font-size: 9px;
}


/* =========================================================
   MODAL
========================================================= */

.modal-overlay {
  position: fixed;

  inset: 0;

  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(2, 6, 23, 0.78);

  backdrop-filter:
    blur(7px);
}

.edit-modal {
  position: relative;

  width: 100%;
  max-width: 430px;

  padding: 27px;

  border: 1px solid #26354a;

  border-radius: 17px;

  background:
    linear-gradient(
      145deg,
      #111a29,
      #0b121d
    );

  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.55);

  animation:
    modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;

    transform:
      translateY(10px)
      scale(0.98);
  }

  to {
    opacity: 1;

    transform:
      translateY(0)
      scale(1);
  }
}

.modal-close {
  position: absolute;

  top: 15px;
  right: 15px;

  width: 30px;
  height: 30px;

  border: 1px solid #263247;

  border-radius: 7px;

  background: #111827;

  color: #64748b;

  font-size: 18px;

  cursor: pointer;
}

.modal-icon {
  width: 43px;
  height: 43px;

  margin-bottom: 15px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: rgba(59, 130, 246, 0.1);

  color: #60a5fa;

  font-size: 19px;
}

.modal-kicker {
  color: #3b82f6;

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 1.2px;
}

.edit-modal h2 {
  margin: 5px 0 4px;

  color: #f8fafc;

  font-size: 20px;
}

.modal-description {
  margin: 0 0 20px;

  color: #64748b;

  font-size: 10px;
}

.order-summary {
  margin-bottom: 19px;

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 7px;
}

.order-summary > div {
  padding: 10px;

  border: 1px solid #1e2b3d;

  border-radius: 8px;

  background: #0c1421;
}

.order-summary span {
  display: block;

  margin-bottom: 5px;

  color: #475569;

  font-size: 7px;
  font-weight: 800;

  letter-spacing: 0.7px;
}

.order-summary strong {
  color: #cbd5e1;

  font-size: 10px;
}

.buy-text {
  color: #22c55e !important;
}

.sell-text {
  color: #ef4444 !important;
}

.modal-input {
  display: flex;
  flex-direction: column;

  gap: 7px;
}

.modal-input label {
  color: #64748b;

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 0.8px;
}

.modal-input input {
  width: 100%;
  height: 44px;

  padding: 0 12px;

  border: 1px solid #29384d;

  border-radius: 8px;

  outline: none;

  background: #09111c;

  color: #f8fafc;

  font-family:
    "SFMono-Regular",
    Consolas,
    monospace;

  font-size: 12px;
}

.modal-input input:focus {
  border-color: #3b82f6;

  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.08);
}

.modal-actions {
  margin-top: 20px;

  display: flex;

  justify-content: flex-end;

  gap: 8px;
}

.modal-cancel,
.modal-save {
  height: 38px;

  padding: 0 15px;

  border-radius: 7px;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;
}

.modal-cancel {
  border: 1px solid #29384d;

  background: #111827;

  color: #94a3b8;
}

.modal-save {
  border: 0;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #4f46e5
    );

  color: white;

  box-shadow:
    0 7px 20px rgba(37, 99, 235, 0.2);
}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1150px) {

  .trading-dashboard {
    padding: 0 16px 40px;
  }

  .terminal-layout {
    grid-template-columns: 1fr;
  }

  .trading-sidebar {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .chart-container {
    height: 560px;
  }

  .balance-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .converter-form {
    grid-template-columns:
      1fr 30px 1fr 1fr;
  }

  .convert-button {
    grid-column: span 4;
  }

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 750px) {

  .trading-dashboard {
    padding: 0 10px 30px;
  }

  .dashboard-header {
    min-height: 65px;
  }

  .brand-icon {
    width: 38px;
    height: 38px;

    font-size: 18px;
  }

  .brand-area h1 {
    font-size: 15px;
  }

  .brand-area p {
    font-size: 9px;
  }

  .market-status {
    display: none;
  }


  /* TOOLBAR */

  .market-toolbar {
    padding: 10px;

    display: grid;

    grid-template-columns:
      1fr 1fr;

    gap: 9px;
  }

  .toolbar-symbol,
  .toolbar-timeframe {
    padding: 0;

    border: 0;

    flex-direction: column;

    align-items: stretch;
  }

  .toolbar-symbol select,
  .toolbar-timeframe select {
    width: 100%;
  }

  .current-price {
    padding: 7px 0 0;

    border: 0;

    grid-column: span 1;
  }

  .candle-timer {
    margin: 0;

    padding: 7px 0 0;

    border: 0;

    justify-content: flex-end;
  }

  .alert-control {
    grid-column: span 2;
  }

  .alert-control input {
    flex: 1;

    width: auto;
  }

  .alert-control button {
    flex-shrink: 0;
  }


  /* TERMINAL */

  .terminal-layout {
    gap: 10px;
  }

  .chart-container {
    height: 420px;
  }

  .panel-header {
    height: 54px;

    padding: 0 13px;
  }

  .panel-header h2 {
    font-size: 14px;
  }

  .chart-live {
    display: none;
  }

  .trading-sidebar {
    display: flex;

    flex-direction: column;
  }


  /* CARDS */

  .card-header {
    padding: 17px 14px 14px;
  }

  .card-header h2 {
    font-size: 14px;
  }

  .card-header p {
    max-width: 260px;

    line-height: 1.5;
  }


  /* BALANCES */

  .balance-grid {
    padding: 10px;

    grid-template-columns:
      1fr 1fr;
  }

  .balance-card {
    grid-template-columns:
      auto 1fr;

    padding: 12px;

    gap: 9px;
  }

  .asset-locked {
    grid-column: 2;
  }


  /* CONVERTER */

  .converter-form {
    padding: 13px;

    grid-template-columns:
      1fr 1fr;
  }

  .swap-arrow {
    display: none;
  }

  .amount-input {
    grid-column: span 2;
  }

  .convert-button {
    grid-column: span 2;
  }


  /* TABLE */

  .modern-table {
    min-width: 850px;
  }

}


/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 430px) {

  .current-price strong {
    font-size: 12px;
  }

  .candle-timer strong {
    font-size: 11px;
  }

  .chart-container {
    height: 350px;
  }

  .balance-grid {
    grid-template-columns: 1fr;
  }

  .balance-card {
    grid-template-columns:
      auto 1fr 1fr;
  }

  .asset-locked {
    grid-column: auto;
  }

  .order-summary {
    grid-template-columns: 1fr;
  }

  .edit-modal {
    padding: 22px;

    border-radius: 14px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-cancel,
  .modal-save {
    width: 100%;
  }

}







































































 
 

        `}
      </style>

    </div>
  );
}
 
