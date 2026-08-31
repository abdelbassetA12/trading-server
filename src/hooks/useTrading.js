import { useState, useRef } from "react";
import { createPosition } from "../logic/position";
import { calculatePnL } from "../logic/pnl";
import { checkSLTP } from "../logic/risk";

export function useTrading() {
  const [balance, setBalance] = useState(100);
  const [position, setPosition] = useState(null);
  const [pnl, setPnl] = useState(0);

  const positionRef = useRef(null);

  /* ================= OPEN ================= */

  function openLong(price, qty, sl, tp) {
    const pos = createPosition(
      "long",
      price,
      sl ? +sl : null,
      tp ? +tp : null,
      +qty
    );

    positionRef.current = pos;
    setPosition(pos);
  }

  function openShort(price, qty, sl, tp) {
    const pos = createPosition(
      "short",
      price,
      sl ? +sl : null,
      tp ? +tp : null,
      +qty
    );

    positionRef.current = pos;
    setPosition(pos);
  }

  /* ================= CLOSE ================= */

  function closePosition(price, reason) {
    const pos = positionRef.current;
    if (!pos) return;

    const profit = calculatePnL(price, pos);

    setBalance((b) => b + profit);
    setPnl(profit);

    alert(`${reason} HIT → ${profit.toFixed(2)}`);

    positionRef.current = null;
    setPosition(null);
  }

  /* ================= UPDATE ================= */

  function update(price) {
    const pos = positionRef.current;
    if (!pos) return;

    // 🔥 تحديث مباشر للـ PnL
    const currentPnL = calculatePnL(price, pos);
    setPnl(currentPnL);

    // 🔥 تحقق من SL / TP
    const hit = checkSLTP(price, pos);
    if (hit) {
      closePosition(price, hit);
    }
  }

  return {
    balance,
    position,
    pnl,
    openLong,
    openShort,
    update,
  };
}