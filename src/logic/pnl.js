

// src/trading/logic/pnl.js

export function calculatePnL(price, position) {
  if (!position) return 0;

  if (position.type === "long") {
    return (price - position.entry) * position.quantity;
  }

  if (position.type === "short") {
    return (position.entry - price) * position.quantity;
  }

  return 0;
}
