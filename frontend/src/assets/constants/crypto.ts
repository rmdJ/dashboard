export const portfolio: {
  name: string;
  quantity: number;
  ath: number;
}[] = [
  { name: "ETH", quantity: 0.7104, ath: 4878.26 },
  { name: "SOL", quantity: 9.1427, ath: 263.21 },
  { name: "LINK", quantity: 17.58, ath: 52.7 },
  { name: "USDC", quantity: 2285.6, ath: 1 },
  { name: "BNB", quantity: 0.4174, ath: 717.48 },
  { name: "NEAR", quantity: 69.99, ath: 20.44 },
  { name: "DOT", quantity: 16.56, ath: 54.98 },
  { name: "ADA", quantity: 50, ath: 3.09 },
  { name: "1INCH", quantity: 13.16, ath: 7.8 },
  { name: "ALGO", quantity: 11.11, ath: 3.56 },
  { name: "KUJI", quantity: 28, ath: 5.08 },
];

// Montant initial en EUR
export const initialInvestmentEUR = 8880;

// Valeur par défaut en USD (sera remplacée par la conversion dynamique)
export const initialInvestmentUSD = 9169;

export const btcObjective = 150000;

export const signalObjectives: {
  name: string;
  value: number;
}[] = [
  { name: "TradingView BTC.D", value: 45 },
  { name: "AppFigures Finance Rank", value: 4 },
  { name: "NewHedge MVRV Z-Score", value: 5.8 },
  { name: "TradingView ETH/BTC", value: 0.0548 },
];
