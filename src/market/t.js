

// ====== position.js ======
export function createPosition(type, entry, sl, tp, quantity, leverage = 1) {
  return { type, entry, sl, tp, quantity, leverage };
}

// ====== risk.js ======
export function checkSLTP(price, position) {
  if (!position) return null;

  const { type, sl, tp } = position;

  if (type === "long") {
    if (sl && price <= sl) return "SL";
    if (tp && price >= tp) return "TP";
  }

  if (type === "short") {
    if (sl && price >= sl) return "SL";
    if (tp && price <= tp) return "TP";
  }

  return null;
}

export function checkLiquidation(price, position) {
  if (!position) return false;

  const { entry, leverage, type } = position;

  const liq =
    type === "long"
      ? entry * (1 - 1 / leverage)
      : entry * (1 + 1 / leverage);

  if (type === "long" && price <= liq) return true;
  if (type === "short" && price >= liq) return true;

  return false;
}

// ====== useTrading.js ======
import { useState, useRef } from "react";
import { calculatePnL, applyFees } from "./pnl";
import { createPosition } from "./position";
import { checkSLTP, checkLiquidation } from "./risk";

export function useTrading() {
  const [balance, setBalance] = useState(1000);
  const [position, setPosition] = useState(null);
  const [pnl, setPnl] = useState(0);
  const [history, setHistory] = useState([]);
  const [equity, setEquity] = useState(1000);

  const peakRef = useRef(1000);
  const positionRef = useRef(null);

  function open(type, price, qty, sl, tp, lev) {
    if (positionRef.current) return;

    const pos = createPosition(type, price, sl, tp, qty, lev);
    positionRef.current = pos;
    setPosition(pos);
  }

  function close(price, reason) {
    const pos = positionRef.current;
    if (!pos) return;

    const raw = calculatePnL(price, pos);
    const fee = applyFees(price, pos.quantity);
    const profit = raw - fee;

    setBalance((b) => b + profit);
    setHistory((h) => [...h, { ...pos, exit: price, profit, reason }]);

    positionRef.current = null;
    setPosition(null);
  }

  function update(price) {
    const pos = positionRef.current;
    if (!pos) return;

    const current = calculatePnL(price, pos);
    setPnl(current);

    const eq = balance + current;
    setEquity(eq);

    if (eq > peakRef.current) peakRef.current = eq;

    if (checkLiquidation(price, pos)) return close(price, "LIQUIDATION");

    const hit = checkSLTP(price, pos);
    if (hit) return close(price, hit);
  }

  return {
    balance,
    pnl,
    position,
    history,
    equity,
    open,
    update,
  };
}

// ====== Replay Engine ======
export function runReplay(data, onTick, speed = 300) {
  let i = 0;

  const id = setInterval(() => {
    if (i >= data.length) return clearInterval(id);

    onTick(data[i]);
    i++;
  }, speed);
}

// ====== Backtest ======
export function runBacktest(data, strategy, trading) {
  data.forEach((candle) => {
    const signal = strategy(candle);

    if (signal === "long") trading.open("long", candle.close, 1);
    if (signal === "short") trading.open("short", candle.close, 1);

    trading.update(candle.close);
  });
}

// ====== Simple Strategy Example ======
export function simpleStrategy(candle) {
  if (candle.close > candle.open) return "long";
  if (candle.close < candle.open) return "short";
  return null;
}

// ====== UI (Controls) ======
import React, { useState } from "react";

export function Controls({ price, open }) {
  const [qty, setQty] = useState(1);
  const [lev, setLev] = useState(5);

  return (
    <div>
      <input value={qty} onChange={(e) => setQty(e.target.value)} />
      <input value={lev} onChange={(e) => setLev(e.target.value)} />

      <button onClick={() => open("long", price, +qty, null, null, +lev)}>
        LONG
      </button>
      <button onClick={() => open("short", price, +qty, null, null, +lev)}>
        SHORT
      </button>
    </div>
  );
}

// ====== Portfolio ======
export function Portfolio({ balance, pnl, equity }) {
  return (
    <div>
      <div>Balance: {balance.toFixed(2)}</div>
      <div>PnL: {pnl.toFixed(2)}</div>
      <div>Equity: {equity.toFixed(2)}</div>
    </div>
  );
}

// ====== MAIN APP ======
import { useEffect } from "react";
import { createChart } from "lightweight-charts";
import { useTrading } from "./useTrading";

export default function App() {
  const trading = useTrading();

  useEffect(() => {
    const chart = createChart(document.body, { height: 500 });
    const series = chart.addCandlestickSeries();

    const ws = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
    );

    ws.onmessage = (e) => {
      const k = JSON.parse(e.data).k;

      const candle = {
        time: k.t / 1000,
        open: +k.o,
        high: +k.h,
        low: +k.l,
        close: +k.c,
      };

      series.update(candle);
      trading.update(candle.close);
    };
  }, []);

  return (
    <div>
      <Controls price={0} open={trading.open} />
      <Portfolio
        balance={trading.balance}
        pnl={trading.pnl}
        equity={trading.equity}
      />
    </div>
  );
}
