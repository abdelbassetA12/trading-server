// market/engine.js

import { getBinanceHistory } from "./providers/binance";
import { getForexHistory } from "./providers/twelvedata";

export class MarketEngine {

  async getHistory(market, symbol, interval) {

    if (market === "crypto") {
      return await getBinanceHistory(symbol, interval);
    }

    if (market === "forex") {
      return await getForexHistory(symbol, interval);
    }

    return [];
  }
}