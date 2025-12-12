// backend/priceGenerator.js
// Generates numbers in a realistic-ish range and small random walk

const MIN = 100;
const MAX = 500;

// start with a base and a random walk function if you want smoother movement
let basePrices = {
  GOOG: 2800,
  TSLA: 700,
  AMZN: 3400,
  META: 320,
  NVDA: 600,
};

function randomWalk(prev, volatility = 0.02) {
  // volatility 0.02 -> up to ±2% change
  const changePct = (Math.random() * (volatility * 2) - volatility);
  const next = prev * (1 + changePct);
  return Number(next.toFixed(2));
}

function generateRandomPrice(ticker) {
  if (ticker && basePrices[ticker]) {
    basePrices[ticker] = randomWalk(basePrices[ticker], 0.015); // smooth
    return basePrices[ticker];
  }
  // fallback: random between MIN and MAX
  return Number((Math.random() * (MAX - MIN) + MIN).toFixed(2));
}

// export a function that optionally accepts ticker for smoother walk
function generateRandomPriceWrapper(ticker) {
  return generateRandomPrice(ticker);
}

module.exports = { generateRandomPrice: generateRandomPriceWrapper };
