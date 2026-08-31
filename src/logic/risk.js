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