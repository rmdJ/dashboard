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
  initialInvestmentEUR,
  initialInvestmentUSD,
  signalObjectives,
  btcObjective,
} from "@/assets/constants/crypto";
import { useEurUsdConversion } from "@/hooks/useEurUsdConversion";
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
  yesterdayValues: any,
  initialInvestment: number
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
      missingPercentage: currentValues["BTC Value"] > 0 && currentValues["BTC Value"] < btcObjective
        ? ((btcObjective - currentValues["BTC Value"]) / currentValues["BTC Value"]) * 100
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
        ? `$${yesterdayValuesData["Portfolio vs Investment"].toLocaleString(
            undefined,
            {
              maximumFractionDigits: 2,
            }
          )}`
        : "N/A",
      current: pnlPercentage,
      objective: initialInvestment,
      progress: Math.min(
        200,
        Math.max(0, (portfolioValue / initialInvestment) * 100)
      ),
      missingPercentage: portfolioValue > 0 && portfolioValue < initialInvestment
        ? ((initialInvestment - portfolioValue) / portfolioValue) * 100
        : 0,
      icon: DollarSign,
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
      objectiveReached: currentValues["NewHedge MVRV Z-Score"]
        ? currentValues["NewHedge MVRV Z-Score"] >= 5.8
        : false,
      icon: TrendingUp,
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
      objectiveReached: currentValues["AppFigures Finance Rank"]
        ? currentValues["AppFigures Finance Rank"] <= 4
        : false,
      icon: TrendingDown,
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
      objectiveReached: currentValues["TradingView BTC.D"]
        ? currentValues["TradingView BTC.D"] <= 41
        : false,
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
      objectiveReached: currentValues["TradingView ETH/BTC"]
        ? currentValues["TradingView ETH/BTC"] >= 0.0548
        : false,
      icon: TrendingUp,
    },
  ];
};

export function Crypto() {
  const { prices } = useBinancePrices();
  const { data: signalData } = useSignalData();
  const { savePortfolioData, getYesterdayValues } = usePortfolioHistory();
  const {
    usdAmount: initialInvestmentConverted,
    loading: conversionLoading,
    error: conversionError,
  } = useEurUsdConversion(initialInvestmentEUR);

  // Utiliser la valeur convertie ou la valeur par défaut en cas d'erreur
  const initialInvestment = conversionError
    ? initialInvestmentUSD
    : initialInvestmentConverted;

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
    const potentialAthValue = currentPrice > asset.ath ? currentValue : asset.quantity * asset.ath;
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
      potentialAthValue,
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

  // Calculer le total du potentiel ATH
  const totalPotentialAthValue = portfolioData.reduce(
    (sum, asset) => sum + asset.potentialAthValue,
    0
  );

  // Ajouter le pourcentage du portfolio à chaque asset et ordonner par current value
  const portfolioDataWithPercentage = portfolioData
    .map((asset) => ({
      ...asset,
      portfolioPercentage:
        totalCurrentValue > 0
          ? (asset.currentValue / totalCurrentValue) * 100
          : 0,
    }))
    .sort((a, b) => b.currentValue - a.currentValue)
    .map((asset, index) => ({
      ...asset,
      rank: index + 1,
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
    yesterdayValues,
    initialInvestment
  );

  // Calculer les équivalents du portfolio en BTC, ETH
  const getPortfolioEquivalents = () => {
    const btcPrice = prices["BTCUSDT"] || 0;
    const ethPrice = prices["ETHUSDT"] || 0;

    const btcEquivalent = totalCurrentValue / btcPrice;
    const ethEquivalent = totalCurrentValue / ethPrice;

    return [
      {
        title: "Portfolio en BTC",
        value: btcPrice > 0 ? `₿${btcEquivalent.toFixed(4)}` : "Loading...",
        yesterday: yesterdayValues?.portfolioBTC
          ? `₿${yesterdayValues.portfolioBTC.toFixed(4)}`
          : "N/A",
        icon: DollarSign,
        objective: 0.1,
        current: btcEquivalent,
        objectiveReached: btcEquivalent >= 0.1,
      },
      {
        title: "Portfolio en ETH",
        value: ethPrice > 0 ? `Ξ${ethEquivalent.toFixed(2)}` : "Loading...",
        yesterday: yesterdayValues?.portfolioETH
          ? `Ξ${yesterdayValues.portfolioETH.toFixed(2)}`
          : "N/A",
        icon: DollarSign,
        objective: 2.1,
        current: ethEquivalent,
        objectiveReached: ethEquivalent >= 2.1,
      },
    ];
  };

  const portfolioEquivalents = getPortfolioEquivalents();

  // Sauvegarder les données actuelles dans le localStorage
  useEffect(() => {
    const btcPrice = prices["BTCUSDT"] || 0;
    const ethPrice = prices["ETHUSDT"] || 0;

    if (btcPrice > 0 && ethPrice > 0 && totalCurrentValue > 0) {
      savePortfolioData({
        btcValue: btcPrice,
        portfolioUSD: totalCurrentValue,
        portfolioBTC: totalCurrentValue / btcPrice,
        portfolioETH: totalCurrentValue / ethPrice,
      });
    }
  }, [prices, totalCurrentValue, savePortfolioData]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Crypto Market
          </h2>
          <div className="text-xs text-muted-foreground mt-1">
            Initial Investment: €{initialInvestmentEUR.toLocaleString()} → $
            {initialInvestment.toLocaleString()}
            {conversionLoading && " (Converting...)"}
            {conversionError && " (Using default rate)"}
            {!conversionLoading && !conversionError && " (Live EUR/USD)"}
          </div>
        </div>
      </div>

      {/* Main Cards Grid - BTC Value et Portfolio vs Investment */}
      <div className="grid gap-4 md:grid-cols-2">
        {cardData
          .filter(
            (card) =>
              card.title === "BTC Value" ||
              card.title === "Portfolio vs Investment"
          )
          .map((card, index) => {
            const Icon = card.icon;

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

                  {/* Progress bar pour les objectifs - seulement pour Portfolio vs Investment */}
                  {card.objective !== null &&
                    card.title === "Portfolio vs Investment" && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            Objectif: ${card.objective.toLocaleString()}
                          </span>
                          <span>
                            {card.progress !== null
                              ? Math.round(card.progress)
                              : 0}
                            %
                          </span>
                        </div>
                        <Progress
                          value={card.progress || 0}
                          className="h-2"
                          isLoading={card.progress === null}
                        />
                        {card.missingPercentage !== undefined && card.missingPercentage > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            Il faut +{card.missingPercentage.toFixed(1)}% pour atteindre l'objectif
                          </div>
                        )}
                      </div>
                    )}

                  {/* Indicateur objectif avec rond coloré - pour les autres cartes avec objectifs */}
                  {card.objective !== null &&
                    card.title !== "Portfolio vs Investment" &&
                    card.title !== "BTC Value" &&
                    card.objectiveReached !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            Objectif:{" "}
                            {card.title.includes("Rank")
                              ? `#${card.objective}`
                              : card.title.includes("BTC.D")
                              ? `${card.objective}%`
                              : card.objective}
                          </span>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                card.objectiveReached
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span
                              className={
                                card.objectiveReached
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {card.objectiveReached
                                ? "Atteint"
                                : "Non atteint"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Progress bar pour BTC Value (garder l'affichage existant) */}
                  {card.objective !== null && card.title === "BTC Value" && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>
                          Objectif: ${card.objective.toLocaleString()}
                        </span>
                        <span>
                          {card.progress !== null
                            ? Math.round(card.progress)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={card.progress || 0}
                        className="h-2"
                        isLoading={card.progress === null}
                      />
                      {card.missingPercentage !== undefined && card.missingPercentage > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          Il faut +{card.missingPercentage.toFixed(1)}% pour atteindre l'objectif
                        </div>
                      )}
                    </div>
                  )}

                  {/* Valeur d'hier */}
                  {card.yesterday && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Hier:{" "}
                        <span className="font-mono">{card.yesterday}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            );

            return <Card key={index}>{cardContent}</Card>;
          })}
      </div>

      {/* Secondary Cards Grid - Signal Cards + Portfolio Equivalents (6 cartes au total) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Signal Cards - AppFigures, NewHedge, TradingView */}
        {cardData
          .filter(
            (card) =>
              card.title === "NewHedge MVRV Z-Score" ||
              card.title === "AppFigures Finance Rank" ||
              card.title === "TradingView BTC.D" ||
              card.title === "TradingView ETH/BTC"
          )
          .map((card, index) => {
            const Icon = card.icon;
            const isClickable = true;

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

                  {/* Indicateur objectif avec rond coloré */}
                  {card.objective !== null &&
                    card.objectiveReached !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            Objectif:{" "}
                            {card.title.includes("Rank")
                              ? `#${card.objective}`
                              : card.title.includes("BTC.D")
                              ? `${card.objective}%`
                              : card.objective}
                          </span>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                card.objectiveReached
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span
                              className={
                                card.objectiveReached
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {card.objectiveReached
                                ? "Atteint"
                                : "Non atteint"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Valeur d'hier */}
                  {card.yesterday && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Hier:{" "}
                        <span className="font-mono">{card.yesterday}</span>
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
                key={`signal-${index}`}
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => window.open(getClickUrl(card.title), "_blank")}
              >
                {cardContent}
              </Card>
            ) : (
              <Card key={`signal-${index}`}>{cardContent}</Card>
            );
          })}

        {/* Portfolio Equivalents Cards */}
        {portfolioEquivalents.map((equivalent, index) => {
          const Icon = equivalent.icon;
          return (
            <Card key={`portfolio-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {equivalent.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{equivalent.value}</div>

                {/* Indicateur objectif avec rond coloré */}
                {equivalent.objective !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        Objectif:{" "}
                        {equivalent.title.includes("BTC")
                          ? `₿${equivalent.objective}`
                          : `Ξ${equivalent.objective}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            equivalent.objectiveReached
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span
                          className={
                            equivalent.objectiveReached
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {equivalent.objectiveReached
                            ? "Atteint"
                            : "Non atteint"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Valeur d'hier */}
                {equivalent.yesterday && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Hier:{" "}
                      <span className="font-mono">{equivalent.yesterday}</span>
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
                <TableHead>Potentiel ATH</TableHead>
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
                  <TableCell className="font-mono font-medium text-green-600">
                    $
                    {asset.potentialAthValue.toLocaleString(undefined, {
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
              <TableRow className="border-t-2 border-gray-400 bg-muted/50">
                <TableCell className="font-bold">-</TableCell>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="font-bold">100%</TableCell>
                <TableCell></TableCell>
                <TableCell className="font-mono font-bold text-lg">
                  $
                  {totalCurrentValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell></TableCell>
                <TableCell className="font-mono font-bold text-lg text-green-600">
                  $
                  {totalPotentialAthValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="font-bold text-green-600">
                  +{((totalPotentialAthValue - totalCurrentValue) / totalCurrentValue * 100).toFixed(0)}%
                </TableCell>
              </TableRow>
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
