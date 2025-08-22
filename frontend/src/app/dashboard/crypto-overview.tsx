import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useBinancePrices } from "@/provider/binance";
import {
  portfolio,
  initialInvestmentEUR,
  initialInvestmentUSD,
  btcObjective,
} from "@/assets/constants/crypto";
import { useEurUsdConversion } from "@/hooks/useEurUsdConversion";
import { Progress } from "@/components/ui/progress";
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Crypto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Portfolio vs Investment Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Portfolio vs Investment
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <div className="flex items-baseline gap-2">
                  <span>
                    $
                    {totalCurrentValue.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Progress bar pour Portfolio vs Investment */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Objectif: ${initialInvestment.toLocaleString()}</span>
                  <span>{Math.round(portfolioProgress)}%</span>
                </div>
                <Progress value={portfolioProgress} className="h-2" />
                {portfolioMissingPercentage > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    Il faut +{portfolioMissingPercentage.toFixed(1)}% pour
                    atteindre l'objectif
                  </div>
                )}
              </div>

              {/* Valeur d'hier */}
              {yesterdayValues?.portfolioUSD && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    Hier:{" "}
                    <span className="font-mono">
                      $
                      {yesterdayValues.portfolioUSD.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* BTC Value Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BTC Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {btcValue ? `$${btcValue.toLocaleString()}` : "Loading..."}
              </div>

              {/* Progress bar pour BTC Value */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Objectif: ${btcObjective.toLocaleString()}</span>
                  <span>{Math.round(btcProgress)}%</span>
                </div>
                <Progress value={btcProgress} className="h-2" />
                {btcMissingPercentage > 0 && (
                  <div className="text-xs text-red-600 mt-1">
                    Il faut +{btcMissingPercentage.toFixed(1)}% pour atteindre
                    l'objectif
                  </div>
                )}
              </div>

              {/* Valeur d'hier */}
              {yesterdayValues?.btcValue && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    Hier:{" "}
                    <span className="font-mono">
                      ${yesterdayValues.btcValue.toLocaleString()}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
