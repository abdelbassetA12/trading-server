// market/providers/twelvedata.js

import { normalizeCandle } from "../normalize";

const API_KEY = "YOUR_KEY";

export async function getForexHistory(symbol, interval) {
  const res = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`
  );

  const data = await res.json();

  return data.values.map(c => normalizeCandle(c, "twelvedata"));
}