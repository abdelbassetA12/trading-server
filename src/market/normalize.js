// market/normalize.js

export function normalizeCandle(data, source) {
  switch (source) {

    case "binance":
      return {
        time: Math.floor(data[0] / 1000),
        open: +data[1],
        high: +data[2],
        low: +data[3],
        close: +data[4],
      };

    case "twelvedata":
      return {
        time: new Date(data.datetime).getTime() / 1000,
        open: +data.open,
        high: +data.high,
        low: +data.low,
        close: +data.close,
      };

    default:
      return null;
  }
}