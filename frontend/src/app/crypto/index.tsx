import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useEffect } from "react";
import { useBinancePrices } from "@/provider/binance";
import {
  portfolio,
  initialInvestment,
  signalObjectives,
  btcObjective,
} from "@/assets/constants/crypto";
import { Progress } from "@/components/ui/progress";
import {
  useSignalData,
  type SignalData,
  type SignalDataItem,
} from "@/hooks/useSignal";
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory";
import { ChartAppFiguresRank } from "@/components/chart-appfigures-rank";
import { ChartTradingViewBTCD } from "@/components/chart-tradingview-btcd";
import { ChartNewHedgeMVRV } from "@/components/chart-newhedge-mvrv";
import { ChartTradingViewETHBTC } from "@/components/chart-tradingview-ethbtc";
import { ChartEvolution } from "@/components/chart-evolution";
import { ChartEthEvolution } from "@/components/chart-eth-evolution";

const getCardData = (
  prices: Record<string, number>,
  pnlPercentage: number,
  signalData: SignalData[],
  portfolioValue: number,
  yesterdayValues: any
) => {
  // Fonction pour récupérer la valeur Signal la plus récente
  const getLatestSignalValue = (source: string) => {
    if (!signalData || signalData.length === 0) return null;

    const latestData = signalData[0]; // Premier élément (trié par date desc)
    if (!latestData?.data) return null;

    const signalItem = latestData.data.find(
      (item: SignalDataItem) => item.source === source
    );
    return signalItem ? signalItem.value : null;
  };

  // Fonction pour récupérer la valeur d'hier
  const getYesterdaySignalValue = (source: string) => {
    if (!signalData || signalData.length < 2) return null;

    const yesterdayData = signalData[1]; // Deuxième élément
    if (!yesterdayData?.data) return null;

    const signalItem = yesterdayData.data.find(
      (item: SignalDataItem) => item.source === source
    );
    return signalItem ? signalItem.value : null;
  };

  // Valeurs actuelles - utiliser Signal seulement, pas de fallback
  const currentValues = {
    "BTC Value": prices["BTCUSDT"] || 0,
    "Portfolio vs Investment": pnlPercentage,
    "TradingView BTC.D": getLatestSignalValue("TradingView BTC.D"),
    "AppFigures Finance Rank": getLatestSignalValue("AppFigures Finance Rank"),
    "NewHedge MVRV Z-Score": getLatestSignalValue("NewHedge MVRV Z-Score"),
    "TradingView ETH/BTC":
      getLatestSignalValue("TradingView ETH/BTC") || prices["ETHBTC"] || 0,
  };

  // Valeurs d'hier - utiliser localStorage pour BTC et Portfolio, Signal pour les autres
  const yesterdayValuesData = {
    "BTC Value": yesterdayValues?.btcValue || null,
    "Portfolio vs Investment": yesterdayValues?.portfolioUSD || null,
    "TradingView BTC.D": getYesterdaySignalValue("TradingView BTC.D"),
    "AppFigures Finance Rank": getYesterdaySignalValue(
      "AppFigures Finance Rank"
    ),
    "NewHedge MVRV Z-Score": getYesterdaySignalValue("NewHedge MVRV Z-Score"),
    "TradingView ETH/BTC": getYesterdaySignalValue("TradingView ETH/BTC"),
  };

  return [
    {
      title: "BTC Value",
      value: prices["BTCUSDT"]
        ? `$${prices["BTCUSDT"].toLocaleString()}`
        : "Loading...",
      yesterday: yesterdayValuesData["BTC Value"]
        ? `$${yesterdayValuesData["BTC Value"].toLocaleString()}`
        : "N/A",
      current: currentValues["BTC Value"],
      objective: btcObjective,
      progress:
        currentValues["BTC Value"] > 0
          ? Math.min(
              100,
              Math.max(0, (currentValues["BTC Value"] / btcObjective) * 100)
            )
          : 0,
      icon: DollarSign,
    },
    {
      title: "Portfolio vs Investment",
      value: (
        <div className="flex items-baseline gap-2">
          <span>
            $
            {portfolioValue.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-sm text-muted-foreground">
            {pnlPercentage >= 0 ? "+" : ""}
            {pnlPercentage.toFixed(1)}%
          </span>
        </div>
      ),
      yesterday: yesterdayValuesData["Portfolio vs Investment"]
        ? `$${yesterdayValuesData["Portfolio vs Investment"].toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`
        : "N/A",
      current: pnlPercentage,
      objective: initialInvestment,
      progress: Math.min(
        200,
        Math.max(0, (portfolioValue / initialInvestment) * 100)
      ),
      icon: DollarSign,
    },
    {
      title: "AppFigures Finance Rank",
      value: currentValues["AppFigures Finance Rank"]
        ? `#${Math.round(currentValues["AppFigures Finance Rank"])}`
        : "Loading...",
      yesterday: yesterdayValuesData["AppFigures Finance Rank"]
        ? `#${Math.round(yesterdayValuesData["AppFigures Finance Rank"])}`
        : "N/A",
      current: currentValues["AppFigures Finance Rank"],
      objective:
        signalObjectives.find((o) => o.name === "AppFigures Finance Rank")
          ?.value || 4,
      progress: currentValues["AppFigures Finance Rank"]
        ? Math.min(
            100,
            Math.max(
              0,
              ((25 - currentValues["AppFigures Finance Rank"]) / (25 - 4)) * 100
            )
          )
        : null,
      icon: TrendingDown,
    },
    {
      title: "NewHedge MVRV Z-Score",
      value: currentValues["NewHedge MVRV Z-Score"]
        ? currentValues["NewHedge MVRV Z-Score"].toFixed(2)
        : "Loading...",
      yesterday: yesterdayValuesData["NewHedge MVRV Z-Score"]
        ? yesterdayValuesData["NewHedge MVRV Z-Score"].toFixed(2)
        : "N/A",
      current: currentValues["NewHedge MVRV Z-Score"],
      objective:
        signalObjectives.find((o) => o.name === "NewHedge MVRV Z-Score")
          ?.value || 5.8,
      progress: currentValues["NewHedge MVRV Z-Score"]
        ? Math.min(
            100,
            Math.max(0, (currentValues["NewHedge MVRV Z-Score"] / 5.8) * 100)
          )
        : null,
      icon: TrendingUp,
    },
    {
      title: "TradingView BTC.D",
      value: currentValues["TradingView BTC.D"]
        ? `${currentValues["TradingView BTC.D"].toFixed(1)}%`
        : "Loading...",
      yesterday: yesterdayValuesData["TradingView BTC.D"]
        ? `${yesterdayValuesData["TradingView BTC.D"].toFixed(1)}%`
        : "N/A",
      current: currentValues["TradingView BTC.D"],
      objective:
        signalObjectives.find((o) => o.name === "TradingView BTC.D")?.value ||
        41,
      progress: currentValues["TradingView BTC.D"]
        ? Math.min(
            100,
            Math.max(
              0,
              ((70 - currentValues["TradingView BTC.D"]) / (70 - 41)) * 100
            )
          )
        : null,
      icon: TrendingDown,
    },
    {
      title: "TradingView ETH/BTC",
      value:
        currentValues["TradingView ETH/BTC"] > 0
          ? currentValues["TradingView ETH/BTC"].toFixed(6)
          : "Loading...",
      yesterday: yesterdayValuesData["TradingView ETH/BTC"]
        ? yesterdayValuesData["TradingView ETH/BTC"].toFixed(6)
        : "N/A",
      current: currentValues["TradingView ETH/BTC"],
      objective:
        signalObjectives.find((o) => o.name === "TradingView ETH/BTC")?.value ||
        0.0548,
      progress:
        currentValues["TradingView ETH/BTC"] > 0
          ? Math.min(
              100,
              Math.max(0, (currentValues["TradingView ETH/BTC"] / 0.0548) * 100)
            )
          : 0,
      icon: TrendingUp,
    },
  ];
};

export function Crypto() {
  const { prices } = useBinancePrices();
  const { data: signalData } = useSignalData();
  const { savePortfolioData, getYesterdayValues } = usePortfolioHistory();

  // Calculer les données du portfolio avec les prix Binance
  const portfolioData = portfolio.map((asset, index) => {
    // Essayer différentes variantes du symbole pour Binance
    const symbol = asset.name.toUpperCase();
    const usdtPair = `${symbol}USDT`;
    const btcPair = `${symbol}BTC`;
    const ethPair = `${symbol}ETH`;

    const currentPrice =
      prices[usdtPair] || prices[btcPair] || prices[ethPair] || 0;
    const currentValue = currentPrice * asset.quantity;
    const athValue = asset.ath * asset.quantity;
    const unrealizedPnL = currentValue - athValue * 0.5; // Estimation basée sur 50% de l'ATH comme prix d'achat moyen
    const pnlPercentage =
      athValue > 0
        ? ((currentValue - athValue * 0.5) / (athValue * 0.5)) * 100
        : 0;
    const athDistance = ((currentPrice - asset.ath) / asset.ath) * 100;

    return {
      rank: index + 1,
      name: asset.name,
      symbol: symbol,
      quantity: asset.quantity,
      currentPrice,
      currentValue,
      ath: asset.ath,
      athValue,
      unrealizedPnL,
      pnlPercentage,
      athDistance,
      binancePair: prices[usdtPair]
        ? usdtPair
        : prices[btcPair]
        ? btcPair
        : prices[ethPair]
        ? ethPair
        : "N/A",
    };
  });

  // Calculer les totaux du portfolio
  const totalCurrentValue = portfolioData.reduce(
    (sum, asset) => sum + asset.currentValue,
    0
  );

  // Ajouter le pourcentage du portfolio à chaque asset
  const portfolioDataWithPercentage = portfolioData.map((asset) => ({
    ...asset,
    portfolioPercentage:
      totalCurrentValue > 0
        ? (asset.currentValue / totalCurrentValue) * 100
        : 0,
  }));
  const totalPnLPercentage =
    initialInvestment > 0
      ? ((totalCurrentValue - initialInvestment) / initialInvestment) * 100
      : 0;

  // Récupérer les valeurs d'hier depuis le localStorage
  const yesterdayValues = getYesterdayValues();

  // Générer les données des cartes avec les valeurs calculées
  const cardData = getCardData(
    prices,
    totalPnLPercentage,
    signalData || [],
    totalCurrentValue,
    yesterdayValues
  );

  // Calculer les équivalents du portfolio en BTC, ETH, SOL
  const getPortfolioEquivalents = () => {
    const btcPrice = prices["BTCUSDT"] || 0;
    const ethPrice = prices["ETHUSDT"] || 0;
    const solPrice = prices["SOLUSDT"] || 0;

    const btcEquivalent = totalCurrentValue / btcPrice;
    const ethEquivalent = totalCurrentValue / ethPrice;
    const solEquivalent = totalCurrentValue / solPrice;

    return [
      {
        title: "Portfolio en BTC",
        value: btcPrice > 0 
          ? `₿${btcEquivalent.toFixed(4)}`
          : "Loading...",
        yesterday: yesterdayValues?.portfolioBTC
          ? `₿${yesterdayValues.portfolioBTC.toFixed(4)}`
          : "N/A",
        icon: DollarSign,
        objective: 0.10,
        progress: btcPrice > 0 
          ? Math.min(100, Math.max(0, (btcEquivalent / 0.10) * 100))
          : null,
      },
      {
        title: "Portfolio en ETH",
        value: ethPrice > 0 
          ? `Ξ${ethEquivalent.toFixed(2)}`
          : "Loading...",
        yesterday: yesterdayValues?.portfolioETH
          ? `Ξ${yesterdayValues.portfolioETH.toFixed(2)}`
          : "N/A",
        icon: DollarSign,
        objective: 2.10,
        progress: ethPrice > 0 
          ? Math.min(100, Math.max(0, (ethEquivalent / 2.10) * 100))
          : null,
      },
      {
        title: "Portfolio en SOL",
        value: solPrice > 0 
          ? `◎${solEquivalent.toFixed(2)}`
          : "Loading...",
        yesterday: yesterdayValues?.portfolioSOL
          ? `◎${yesterdayValues.portfolioSOL.toFixed(2)}`
          : "N/A",
        icon: DollarSign,
        objective: 45,
        progress: solPrice > 0 
          ? Math.min(100, Math.max(0, (solEquivalent / 45) * 100))
          : null,
      },
    ];
  };

  const portfolioEquivalents = getPortfolioEquivalents();

  // Sauvegarder les données actuelles dans le localStorage
  useEffect(() => {
    const btcPrice = prices["BTCUSDT"] || 0;
    const ethPrice = prices["ETHUSDT"] || 0;
    const solPrice = prices["SOLUSDT"] || 0;
    
    if (btcPrice > 0 && ethPrice > 0 && solPrice > 0 && totalCurrentValue > 0) {
      savePortfolioData({
        btcValue: btcPrice,
        portfolioUSD: totalCurrentValue,
        portfolioBTC: totalCurrentValue / btcPrice,
        portfolioETH: totalCurrentValue / ethPrice,
        portfolioSOL: totalCurrentValue / solPrice
      });
    }
  }, [prices, totalCurrentValue, savePortfolioData]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Crypto Market
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cardData.map((card, index) => {
          const Icon = card.icon;
          const isClickable =
            card.title === "AppFigures Finance Rank" ||
            card.title === "NewHedge MVRV Z-Score" ||
            card.title === "TradingView BTC.D" ||
            card.title === "TradingView ETH/BTC";

          const cardContent = (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>

                {/* Progress bar pour les objectifs */}
                {card.objective !== null && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        Objectif:{" "}
                        {card.title.includes("Rank")
                          ? `#${card.objective}`
                          : card.title.includes("Portfolio")
                          ? `$${card.objective.toLocaleString()}`
                          : card.objective}
                      </span>
                      <span>
                        {card.progress !== null ? Math.round(card.progress) : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={card.progress || 0}
                      className="h-2"
                      isLoading={card.progress === null}
                    />
                  </div>
                )}

                {/* Valeur d'hier */}
                {card.yesterday && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Hier: <span className="font-mono">{card.yesterday}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          );

          const getClickUrl = (title: string) => {
            if (title === "AppFigures Finance Rank") {
              return "https://appfigures.com/top-apps/ios-app-store/united-states/iphone/finance";
            }
            if (title === "NewHedge MVRV Z-Score") {
              return "https://newhedge.io/terminal/bitcoin/mvrv-z-score";
            }
            if (title === "TradingView BTC.D") {
              return "https://fr.tradingview.com/symbols/BTC.D/";
            }
            if (title === "TradingView ETH/BTC") {
              return "https://fr.tradingview.com/symbols/ETHBTC/";
            }
            return "";
          };

          return isClickable ? (
            <Card
              key={index}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => window.open(getClickUrl(card.title), "_blank")}
            >
              {cardContent}
            </Card>
          ) : (
            <Card key={index}>{cardContent}</Card>
          );
        })}
      </div>

      {/* Portfolio Equivalents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {portfolioEquivalents.map((equivalent, index) => {
          const Icon = equivalent.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {equivalent.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{equivalent.value}</div>
                
                {/* Progress bar pour les objectifs */}
                {equivalent.objective !== null && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        Objectif: {equivalent.objective}
                      </span>
                      <span>
                        {equivalent.progress !== null ? Math.round(equivalent.progress) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={equivalent.progress || 0}
                      className="h-2"
                      isLoading={equivalent.progress === null}
                    />
                  </div>
                )}

                {/* Valeur d'hier */}
                {equivalent.yesterday && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Hier: <span className="font-mono">{equivalent.yesterday}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Portfolio %</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>ATH</TableHead>
                <TableHead>Distance from ATH</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolioDataWithPercentage.map((asset) => (
                <TableRow key={asset.rank}>
                  <TableCell className="font-medium">{asset.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.symbol}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {asset.quantity.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </TableCell>
                  <TableCell className="font-mono">
                    {asset.portfolioPercentage.toFixed(1)}%
                  </TableCell>
                  <TableCell className="font-mono">
                    {asset.currentPrice > 0
                      ? `$${asset.currentPrice.toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    $
                    {asset.currentValue.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    $
                    {asset.ath.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        asset.athDistance >= 0
                          ? "default"
                          : asset.athDistance >= -50
                          ? "secondary"
                          : "destructive"
                      }
                      className={`text-xs ${
                        asset.athDistance >= 0
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : ""
                      }`}
                    >
                      {asset.athDistance >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {asset.athDistance.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Evolution Chart */}
      <ChartEvolution />

      {/* ETH Evolution Chart */}
      <ChartEthEvolution />

      {/* AppFigures Finance Rank Chart */}
      <ChartAppFiguresRank />

      {/* TradingView BTC.D Chart */}
      <ChartTradingViewBTCD />

      {/* NewHedge MVRV Z-Score Chart */}
      <ChartNewHedgeMVRV />

      {/* TradingView ETH/BTC Chart */}
      <ChartTradingViewETHBTC />
    </div>
  );
}
