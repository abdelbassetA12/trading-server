// hooks/useMarket.js

import { useState, useEffect, useRef } from "react";
import { MarketEngine } from "../engine";

const engine = new MarketEngine();

export function useMarket(market, symbol, interval) {

  const [data, setData] = useState([]);

  const wsRef = useRef(null);

  useEffect(() => {

    async function load() {
      const candles = await engine.getHistory(market, symbol, interval);
      setData(candles);
    }

    load();

  }, [market, symbol, interval]);

  return { data };
}