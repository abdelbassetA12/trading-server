// market/providers/binance.js

import { normalizeCandle } from "../normalize";

export async function getBinanceHistory(symbol, interval) {
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`
  );

  const data = await res.json();

  return data.map(c => normalizeCandle(c, "binance"));
}