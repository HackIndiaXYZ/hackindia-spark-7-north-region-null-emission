export function estimateTokenCount(text) {
  return Math.ceil(text.length / 4);
}

export function calculateCost(tokenCount, coefficients) {
  const multiplier = tokenCount / 1000;
  return {
    energy_kwh: parseFloat((multiplier * coefficients.energy_kwh).toFixed(6)),
    co2_grams: parseFloat((multiplier * coefficients.co2_grams).toFixed(4)),
    water_ml: parseFloat((multiplier * coefficients.water_ml).toFixed(4))
  };
}