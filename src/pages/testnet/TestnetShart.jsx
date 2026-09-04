
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

  // ENTRY
  entryLineRef.current = candleSeriesRef.current.createPriceLine({
    price: entry,
    color: "#22c55e",
    lineWidth: 2,
    axisLabelVisible: true,
    title: type.toUpperCase(),
  });

  // SL
  if (sl) {
    slLineRef.current = candleSeriesRef.current.createPriceLine({
      price: sl,
      color: "#ef4444",
      lineWidth: 2,
      axisLabelVisible: true,
      title: "SL",
    });
  }

  // TP
  if (tp) {
    tpLineRef.current = candleSeriesRef.current.createPriceLine({
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
    candleSeriesRef.current.removePriceLine(entryLineRef.current);
    entryLineRef.current = null;
  }

  if (slLineRef.current) {
    candleSeriesRef.current.removePriceLine(slLineRef.current);
    slLineRef.current = null;
  }

  if (tpLineRef.current) {
    candleSeriesRef.current.removePriceLine(tpLineRef.current);
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
  /* ================= INIT (HTML STYLE) ================= */
  useEffect(() => {
    if (chartRef.current) return;

    const chart = createChart(document.getElementById("chart"), {
      width: window.innerWidth * 0.75,
      height: window.innerHeight - 50,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = chart.addCandlestickSeries();
    candleSeriesRef.current.applyOptions({
 
});

    //loadHistory(symbol, interval);
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

  /* ================= SYMBOL / INTERVAL UPDATE ================= */
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    //loadHistory(symbol, interval);
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
      candleCloseTimeRef.current = Math.floor(k.T / 1000);

      updatePriceLabel(candle.close);
      checkAlerts(candle.close);

        // 👇 هذا هو المكان الصحيح
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

    const line = candleSeriesRef.current.createPriceLine({
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
      candleSeriesRef.current?.priceToCoordinate(price) ?? 100;

    const now = Math.floor(Date.now() / 1000);
    let remaining = candleCloseTimeRef.current - now;
    if (remaining < 0) remaining = 0;

    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;

    const el = priceLabelRef.current;
    if (!el) return;

    el.style.top = y + "px";
    
    el.innerHTML = `
      
      <div style="color:#9ca3af">${min}:${sec
      .toString()
      .padStart(2, "0")}</div>
    ` ;
    
  
  }


  /* ================= COUNTDOWN ================= */
  function startCountdown() {
    setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      let remaining = candleCloseTimeRef.current - now;

      if (remaining < 0) remaining = 0;

      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;

      setCountdown(`${min}:${sec.toString().padStart(2, "0")}`);

      updatePriceLabel(lastPrice);
    }, 1000);
  }



 

 
 // testnet items


 
 const fetchOpenOrders = async () => {
   try {
     const res = await axios.get(
       `${API_BASE}/api/testnet/open-orders`
     );
 
     setOpenOrders(res.data);
   } catch (err) {
     console.error("Error fetching open orders:", err);
   }
 };
 
 useEffect(() => {
   fetchOpenOrders();
 
   const interval = setInterval(fetchOpenOrders, 3000);
   return () => clearInterval(interval);
 }, []);




   const fetchBalances = async () => {
   try {
     const res = await fetch(`${API_BASE}/api/testnet/balance`);
     const data = await res.json();
     //setBalances(data);
     const filtered = data.filter(b =>
   ["USDT", "BTC", "ETH", "SOL"].includes(b.asset)
 );
 
 setBalances(filtered);
   } catch (err) {
     console.error("Error fetching balances:", err);
   }
 };
 useEffect(() => {
   fetchBalances();
 
   const interval = setInterval(fetchBalances, 5000); // تحديث كل 5 ثواني
   return () => clearInterval(interval);
 }, []);
 
  

const cancel = async (symbol, orderId) => {
  try {
    await axios.delete(`${API_BASE}/api/testnet/cancel-order`, {
      data: { symbol, orderId }
    });

    alert("✅ Order Cancelled");
    fetchOpenOrders();

  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("❌ Cancel Failed");
  }
};



const convert = async () => {
  try {
    const res = await axios.post(`${API_BASE}/api/convert`, {
      fromAsset,
      toAsset,
      amount: parseFloat(amount)
    });

    alert("✅ Conversion Done");
    console.log(res.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("❌ Conversion Failed");
  }
};




const loadSignals = async () => {
    const res = await axios.get(`${API_BASE}/signals`);
    setSignals(res.data);
  };

  useEffect(() => {
    loadSignals();
    const i = setInterval(loadSignals, 5000);
    return () => clearInterval(i);
  }, []);





  const fetchBinanceTrades = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/testnet/trades-all`
      );
      const data = await res.json();
  
      setBinanceTrades(data);
    } catch (err) {
      console.error("Error fetching binance trades:", err);
    }
  };
  
  useEffect(() => {
    fetchBinanceTrades();
  
    const interval = setInterval(fetchBinanceTrades, 3000);
    return () => clearInterval(interval);
  }, []);
  
  
  
  
  function formatDate(time) {
    const d = new Date(time);
    return d.toLocaleString(); // أو toLocaleTimeString()
  }


  function drawOpenOrders(orders) {
  // حذف القديم
  ordersLinesRef.current.forEach(line => {
    candleSeriesRef.current.removePriceLine(line);
  });
  ordersLinesRef.current = [];

  if (!orders || orders.length === 0) return;

  orders.forEach(order => {
    const price = parseFloat(order.price);
    if (!price || price === 0) return;

    const isBuy = order.side === "BUY";

    // ✅ opacity حسب الكمية
    const opacity = Math.min(1, parseFloat(order.origQty) / 10);

   

    // ✅ المسافة من السعر الحالي
    const distance = Math.abs(lastPrice - price);
    const line = candleSeriesRef.current.createPriceLine({
      price,
      color: isBuy ? "#22c55e" : "#ef4444",
      lineWidth: 2, // 👈 هنا السمك
      lineStyle: 0,
      axisLabelVisible: true,
      //title: `${order.side} (${order.type})`,
      title: `${order.side} (${order.type}) ${order.origQty} `, // 👈 هنا النص
    });


    ordersLinesRef.current.push(line);
  });
}

useEffect(() => {
  if (!candleSeriesRef.current) return;

  drawOpenOrders(openOrders);
}, [openOrders]);



const handleUpdateOrder = async () => {
  try {
    await axios.post(`${API_BASE}/api/testnet/modify-order`, {
      symbol: selectedOrder.symbol,
      orderId: selectedOrder.orderId,
      price: parseFloat(newPrice),
      quantity: selectedOrder.origQty,
      side: selectedOrder.side
    });

    setEditModal(false);
    setSelectedOrder(null);

    fetchOpenOrders();

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

  /* ================= UI ================= */
  return (
    <div style={{ background: "#0f172a", color: "white", height: "100vh" }}>
      <style>
        {
          `
          body {
  margin: 0;
  padding: 0;
  
  background: #0f172a;
  color: white;
  font-family: Arial;
}
          .topbar {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #111827;
  align-items: center;
}

select, button, input {
  padding: 8px;
  background: #1f2937;
  color: white;
  border: 1px solid #374151;
  border-radius: 6px;
}
          `
        }
      </style>

      

<div>
  <h2>📡 Open Orders (Real Binance)</h2>

{openOrders.length === 0 ? (
  <p>No open orders</p>
) : (
  <table >
    <thead>
      <tr>
        <th>Symbol</th>
        <th>Side</th>
        <th>Type</th>
        <th>Price</th>
        <th>Qty</th>
        <th>Status</th>
        <th>Action</th>
        <th>Edit</th>
      </tr>
    </thead>

    <tbody>
      {openOrders.map((o, i) => (
        <tr key={i}>
          <td>{o.symbol}</td>

          <td style={{ color: o.side === "BUY" ? "lime" : "red" }}>
            {o.side}
          </td>

          <td>{o.type}</td>

          <td>{o.price}</td>

          <td>{o.origQty}</td>

          <td style={{ color: "orange" }}>
            {o.status}
            hhhhhhhhhhhh
          </td>

          <td>
  <button
    onClick={() => cancel(o.symbol, o.orderId)}
    style={{
      background: "red",
      color: "white",
      border: "none",
      padding: "5px 10px",
      borderRadius: "5px",
      cursor: "pointer"
    }}
  >
    Cancel
  </button>
</td>
<td>
  <button
  onClick={() => {
    setSelectedOrder(o);
    setNewPrice(o.price);
    setEditModal(true);
  }}
  style={{
    background: "blue",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer"
  }}
>
  Edit
</button>
</td>
        </tr>
      ))}
    </tbody>
  </table>
)}


</div>

{editModal && (
  <div style={modalStyles.overlay}>
    <div style={modalStyles.modal}>
      <h2>✏️ Edit Order</h2>

      <p><b>Symbol:</b> {selectedOrder.symbol}</p>
      <p><b>Side:</b> {selectedOrder.side}</p>

      <input
        type="number"
        value={newPrice}
        onChange={(e) => setNewPrice(e.target.value)}
        placeholder="New Price"
        style={modalStyles.input}
      />

      <div style={{ marginTop: 15 }}>
        <button onClick={handleUpdateOrder} style={modalStyles.save}>
          Save
        </button>

        <button onClick={() => setEditModal(false)} style={modalStyles.cancel}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


      <div>
        <h1>🚀 Testnet Trading Dashboard</h1>
        
  {balances.map((b, i) => (
    <div key={i} >
      <h3>{b.asset}</h3>
      <p>Free: {b.free}</p>
      <p>Locked: {b.locked}</p>
    </div>
  ))}
</div>


 <div >
  <h3>💱 Convert Assets</h3>

  <select value={fromAsset} onChange={e => setFromAsset(e.target.value)}>
    <option>USDT</option>
    <option>SOL</option>
    <option>BTC</option>
    <option>ETH</option>
    <option>SEI</option>
  </select>

  <span> ➜ </span>

  <select value={toAsset} onChange={e => setToAsset(e.target.value)}>
    <option>USDT</option>
    <option>SOL</option>
    <option>BTC</option>
    <option>ETH</option>
    <option>SEI</option>
  </select>

  <input
    type="number"
    placeholder="Amount"
    value={amount}
    onChange={e => setAmount(e.target.value)}
  />

  <button onClick={convert}>Convert</button>
</div>


 {/* 📊 Table */}
      <div>
        <h3>📊 Market Overview</h3>
        <table >
          <thead>
            <tr>
              <th>Coin</th>
              <th>Signal</th>
              <th>Score</th>
              <th>Volume</th>
              <th>Entry</th>
  <th>SL</th>
  <th>TP</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s, i) => (
              <tr key={i} onClick={() => setSelected(s.symbol)}>
                <td>{s.symbol}</td>
                <td style={getSignalStyle(s.signal)}>{s.signal}</td>
                <td>{s.score}</td>
                <td>{s.volume}x</td>
                <td>{s.trade?.entry?.toFixed(2) || "-"}</td>
    <td>{s.trade?.stopLoss?.toFixed(2) || "-"}</td>
    <td>{s.trade?.takeProfit?.toFixed(2) || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>




      <div>
         <h2>🔥 Binance Real Trades</h2>

{binanceTrades.length === 0 ? (
  <p>No Binance trades yet</p>
) : (
  <table>

    <thead>
  <tr>
    <th>Symbol</th>
    <th>qty</th>
    <th>Entry</th>
    <th>Exit</th>
    <th>Profit</th>
    <th>Entry Time</th>
    <th>Exit Time</th>
    <th>Duration (min)</th>
    <th>Status</th>
     <th>result</th>
  </tr>
</thead>
<tbody>
  {binanceTrades.map((t, i) => (
    <tr key={i}>
      <td>{t.symbol}</td>
      <td>{t.qty}</td>
      <td>{t.entry?.toFixed(2)}</td>
      <td>{t.exit?.toFixed(2)}</td>

      <td style={{ color: t.profit > 0 ? "lime" : "red" }}>
        {t.profit?.toFixed(2)}
      </td>

      <td>{formatDate(t.entryTime)}</td>
      <td>{formatDate(t.exitTime)}</td>

      <td>{t.duration}</td>

      <td>{t.status}</td>
      <td>{t.result}</td>
    </tr>
  ))}
</tbody>
   
  </table>
)}

      </div>





      {/* TOPBAR */}
      <div className="topbar" >
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          <option>BTCUSDT</option>
          <option>ETHUSDT</option>
          <option>SOLUSDT</option>
        </select>

        <select value={interval} onChange={(e) => setIntervalVal(e.target.value)}>
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
        </select>

        <input
          value={alertPrice}
          onChange={(e) => setAlertPrice(e.target.value)}
          placeholder="Alert Price"
        />

        <button onClick={setAlert}>Set Alert</button>
        

       
        <span>Candle: {countdown}</span>
      </div>

      {/* MAIN */}
      <div style={{ display: "flex", height: "calc(100vh - 50px)" }}>
        <div id="chart" style={{ flex: 3, position: "relative" }}>
          <div
            ref={priceLabelRef}
            style={{
              position: "absolute",
              right: -40,
              
             
              transform: "translateY(-50%)",
              background: "#111827",
              border: "1px solid #374151",
             padding: "6px 10px",
              borderRadius: 6,
              fontSize: 12,
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
        </div>

        <div style={{ flex: 1, background: "#0b1220", padding: 10 }}>
          <div style={{ background: "#111827", padding: 10 }}>
            


            <Controls
  price={lastPrice}
  openLong={trading.openLong}
  openShort={trading.openShort}
/>

<Portfolio
  balance={trading.balance}
  pnl={trading.pnl}
  position={trading.position}
/>

            
           
        
          </div>

          <div style={{ marginTop: 10, background: "#111827", padding: 10 }}>
            <h3>Alerts</h3>
            {alerts.map((a, i) => (
              <div key={i}>Alert @ {a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );


}

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  modal: {
    background: "#1E293B",
    padding: 20,
    borderRadius: 10,
    width: 300,
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    border: "none",
    marginTop: 10
  },
  save: {
    background: "green",
    color: "white",
    border: "none",
    padding: "8px 15px",
    marginRight: 10,
    borderRadius: 5,
    cursor: "pointer"
  },
  cancel: {
    background: "red",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: 5,
    cursor: "pointer"
  }
};   