import { useMemo } from "react";
import { useBinancePrices, useBinancePrice } from "@/provider/binance";
// import { useCryptoData } from "./useCrypto"; // Module non trouvé

// Types pour les données crypto
interface CryptoData {
  symbol?: string;
  name?: string;
  price?: string | number;
  [key: string]: any;
}

// Hook pour combiner les données MongoDB avec les prix Binance
export function useCryptoWithBinancePrices() {
  // Désactivé temporairement car useCryptoData n'existe pas
  const mongoData: CryptoData[] | undefined = undefined;
  const mongoLoading = false;
  const mongoError = null;
  
  const {
    prices: binancePrices,
    isLoading: binanceLoading,
    error: binanceError,
  } = useBinancePrices();

  const combinedData = useMemo(() => {
    if (!mongoData || !binancePrices) return [];

    return mongoData.map((crypto: CryptoData) => {
      // Essayer de trouver le prix Binance avec différentes variantes du symbole
      const binanceSymbol = crypto.symbol?.toUpperCase();
      const usdtSymbol = `${binanceSymbol}USDT`;
      const btcSymbol = `${binanceSymbol}BTC`;
      const ethSymbol = `${binanceSymbol}ETH`;

      const binancePrice =
        binancePrices[usdtSymbol] ||
        binancePrices[btcSymbol] ||
        binancePrices[ethSymbol] ||
        binancePrices[binanceSymbol];

      return {
        ...crypto,
        binancePrice,
        binanceSymbol: binancePrice
          ? binancePrices[usdtSymbol]
            ? usdtSymbol
            : binancePrices[btcSymbol]
            ? btcSymbol
            : binancePrices[ethSymbol]
            ? ethSymbol
            : binanceSymbol
          : null,
        hasBinancePrice: !!binancePrice,
      };
    });
  }, [mongoData, binancePrices]);

  return {
    data: combinedData,
    isLoading: mongoLoading || binanceLoading,
    error: mongoError || binanceError,
    mongoData,
    binancePrices,
  };
}

// Hook pour récupérer le prix Binance d'une crypto spécifique
export function useCryptoBinancePrice(symbol: string) {
  const binanceSymbol = symbol?.toUpperCase();
  const usdtSymbol = `${binanceSymbol}USDT`;

  const { price, isLoading, error } = useBinancePrice(usdtSymbol);

  return {
    price,
    symbol: usdtSymbol,
    isLoading,
    error,
  };
}

// Hook pour comparer les prix MongoDB vs Binance
export function usePriceComparison() {
  const { data, isLoading, error } = useCryptoWithBinancePrices();

  const comparison = useMemo(() => {
    if (!data) return [];

    return data
      .filter((crypto: any) => crypto.hasBinancePrice && crypto.price)
      .map((crypto: any) => {
        const mongoPriceNum =
          typeof crypto.price === "string"
            ? parseFloat(crypto.price)
            : crypto.price;
        const binancePriceNum = crypto.binancePrice!;

        const difference = binancePriceNum - mongoPriceNum;
        const percentageDiff =
          mongoPriceNum !== 0 ? (difference / mongoPriceNum) * 100 : 0;

        return {
          symbol: crypto.symbol,
          name: crypto.name,
          mongoPrice: mongoPriceNum,
          binancePrice: binancePriceNum,
          difference,
          percentageDiff,
          binanceSymbol: crypto.binanceSymbol,
        };
      })
      .sort((a: any, b: any) => Math.abs(b.percentageDiff) - Math.abs(a.percentageDiff));
  }, [data]);

  return {
    comparison,
    isLoading,
    error,
  };
}

// Hook pour obtenir les cryptos avec les plus gros écarts de prix
export function useTopPriceDifferences(limit: number = 10) {
  const { comparison, isLoading, error } = usePriceComparison();

  const topDifferences = useMemo(() => {
    return comparison.slice(0, limit);
  }, [comparison, limit]);

  return {
    data: topDifferences,
    isLoading,
    error,
  };
}
