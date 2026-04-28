export function energyEquivalent(kwh) {
  const phoneCharges = kwh * 8.5;
  if (phoneCharges < 0.01) {
    return `${(kwh * 1000000).toFixed(1)} mWh`;
  }
  if (phoneCharges < 1) {
    return `${(phoneCharges * 100).toFixed(0)}% of a phone charge`;
  }
  return `${phoneCharges.toFixed(1)} phone charges`;
}

export function co2Equivalent(grams) {
  const kmDriven = grams * 0.006;
  if (grams < 1) {
    return `${(grams * 1000).toFixed(0)} mg of CO₂`;
  }
  if (kmDriven < 0.1) {
    return `${grams.toFixed(1)}g CO₂ — ${(kmDriven * 1000).toFixed(0)}m driven`;
  }
  return `${grams.toFixed(1)}g CO₂ — ${kmDriven.toFixed(2)} km driven`;
}

export function waterEquivalent(ml) {
  const glasses = ml / 250;
  if (ml < 1) {
    return `${(ml * 1000).toFixed(0)} µL of water`;
  }
  if (glasses < 0.1) {
    return `${ml.toFixed(1)} ml of water`;
  }
  if (glasses < 1) {
    return `${(glasses * 100).toFixed(0)}% of a glass`;
  }
  return `${glasses.toFixed(1)} glasses of water`;
}

export function formatNumber(num, decimals = 2) {
  if (num === 0) return '0';
  if (Math.abs(num) < 0.001) return num.toExponential(1);
  if (Math.abs(num) < 1) return num.toFixed(decimals + 2);
  if (Math.abs(num) >= 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return num.toFixed(decimals);
}