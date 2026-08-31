import {  useState } from "react";

export default function Controls({ price, openLong, openShort }) {
  const [qty, setQty] = useState(1);
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");

  return (
    <div>
      <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" />
      <input value={sl} onChange={(e) => setSl(e.target.value)} placeholder="SL" />
      <input value={tp} onChange={(e) => setTp(e.target.value)} placeholder="TP" />

      <button onClick={() => openLong(price, qty, sl, tp)}>LONG</button>
      <button onClick={() => openShort(price, qty, sl, tp)}>SHORT</button>
    </div>
  );
}