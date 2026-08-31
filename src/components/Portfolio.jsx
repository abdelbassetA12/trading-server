// src/trading/components/Portfolio.jsx

export default function Portfolio({ balance, pnl, position }) {
  return (
    <div>
      <h3>Portfolio</h3>
      <div>Balance: {balance.toFixed(2)}</div>
      <div>PnL: {pnl.toFixed(2)}</div>
      <div>
        Position:{" "}
        {position
          ? `${position.type} @ ${position.entry}`
          : "None"}
      </div>
    </div>
  );
}