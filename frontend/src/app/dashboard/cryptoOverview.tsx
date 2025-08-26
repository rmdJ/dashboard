import { DollarSign } from "lucide-react";
import { useBinancePrices } from "@/provider/binance";
import {
  portfolio,
  initialInvestmentEUR,
  initialInvestmentUSD,
  btcObjective,
} from "@/assets/constants/crypto";
import { useEurUsdConversion } from "@/hooks/useEurUsdConversion";
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory";
import { MetricCard } from "@/components/ui/metric-card";

export function CryptoOverview() {
  const { prices } = useBinancePrices();
  const { getYesterdayValues } = usePortfolioHistory();
  const { usdAmount: initialInvestmentConverted, error: conversionError } =
    useEurUsdConversion(initialInvestmentEUR);

  // Utiliser la valeur convertie ou la valeur par défaut en cas d'erreur
  const initialInvestment = conversionError
    ? initialInvestmentUSD
    : initialInvestmentConverted;

  // Calculer les données du portfolio avec les prix Binance
  const portfolioData = portfolio.map((asset) => {
    const symbol = asset.name.toUpperCase();
    const usdtPair = `${symbol}USDT`;
    const btcPair = `${symbol}BTC`;
    const ethPair = `${symbol}ETH`;

    const currentPrice =
      prices[usdtPair] || prices[btcPair] || prices[ethPair] || 0;
    const currentValue = currentPrice * asset.quantity;

    return {
      name: asset.name,
      symbol: symbol,
      quantity: asset.quantity,
      currentPrice,
      currentValue,
    };
  });

  // Calculer les totaux du portfolio
  const totalCurrentValue = portfolioData.reduce(
    (sum, asset) => sum + asset.currentValue,
    0
  );

  // Récupérer les valeurs d'hier depuis le localStorage
  const yesterdayValues = getYesterdayValues();

  // Données pour BTC Value
  const btcValue = prices["BTCUSDT"] || 0;
  const btcProgress =
    btcValue > 0
      ? Math.min(100, Math.max(0, (btcValue / btcObjective) * 100))
      : 0;
  const btcMissingPercentage =
    btcValue > 0 && btcValue < btcObjective
      ? ((btcObjective - btcValue) / btcValue) * 100
      : 0;

  // Données pour Portfolio vs Investment
  const portfolioProgress = Math.min(
    200,
    Math.max(0, (totalCurrentValue / initialInvestment) * 100)
  );
  const portfolioMissingPercentage =
    totalCurrentValue > 0 && totalCurrentValue < initialInvestment
      ? ((initialInvestment - totalCurrentValue) / totalCurrentValue) * 100
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Portfolio vs Investment Card */}
      <MetricCard
        title="Portfolio vs Investment"
        icon={DollarSign}
        value={`$${totalCurrentValue.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`}
        progress={{
          value: portfolioProgress,
          target: `Objectif: $${initialInvestment.toLocaleString()}`,
          label: `${Math.round(portfolioProgress)}%`,
        }}
        warningMessage={
          portfolioMissingPercentage > 0
            ? `Il faut +${portfolioMissingPercentage.toFixed(1)}% pour atteindre l'objectif`
            : undefined
        }
        historicalValue={
          yesterdayValues?.portfolioUSD
            ? {
                label: "Hier",
                value: `$${yesterdayValues.portfolioUSD.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}`,
              }
            : undefined
        }
      />
      
      {/* BTC Value Card */}
      <MetricCard
        title="BTC Value"
        icon={DollarSign}
        value={btcValue ? `$${btcValue.toLocaleString()}` : "Loading..."}
        progress={{
          value: btcProgress,
          target: `Objectif: $${btcObjective.toLocaleString()}`,
          label: `${Math.round(btcProgress)}%`,
        }}
        warningMessage={
          btcMissingPercentage > 0
            ? `Il faut +${btcMissingPercentage.toFixed(1)}% pour atteindre l'objectif`
            : undefined
        }
        historicalValue={
          yesterdayValues?.btcValue
            ? {
                label: "Hier",
                value: `$${yesterdayValues.btcValue.toLocaleString()}`,
              }
            : undefined
        }
      />
    </div>
  );
}
