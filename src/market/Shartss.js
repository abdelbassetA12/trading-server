
import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";


import { useTrading } from "../trading/hooks/useTrading";
import Controls from "../trading/components/Controls";
import Portfolio from "../trading/components/Portfolio";

import { useMarket } from "../market/hooks/useMarket";

export default function Shartss() {

 


  const trading = useTrading();


  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const wsRef = useRef(null);

 
  const alertLinesRef = useRef([]);

  const candleCloseTimeRef = useRef(0);

  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setIntervalVal] = useState("15m");

  const [lastPrice, setLastPrice] = useState(0);
  

  const [alerts, setAlerts] = useState([]);
  const [alertPrice, setAlertPrice] = useState("");
  const [countdown, setCountdown] = useState("--");

  const priceLabelRef = useRef(null);

  const entryLineRef = useRef(null);
const slLineRef = useRef(null);
const tpLineRef = useRef(null);


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
  lastValueVisible: false,
  //priceLineVisible: false,
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

  /* ================= HISTORY ================= */
  /*
  async function loadHistory(sym, intv) {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${intv}&limit=200`
    );

    const data = await res.json();

    const candles = data.map((c) => ({
      time: Math.floor(c[0] / 1000),
      open: +c[1],
      high: +c[2],
      low: +c[3],
      close: +c[4],
    }));

    candleSeriesRef.current?.setData(candles);
  }
    */

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
      <div>${price.toFixed(2)}</div>
      <div style="color:#9ca3af">${min}:${sec
      .toString()
      .padStart(2, "0")}</div>
    `;
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



 

 

  

  

  /* ================= UI ================= */
  return (
    <div style={{ background: "#0f172a", color: "white", height: "100vh" }}>
      <style>
        {
          `
          body {
  margin: 0;
  padding: 0;
   overflow: hidden;
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
              right: 0,
              width: 48,
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
