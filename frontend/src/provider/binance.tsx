import React, { createContext, useContext, useEffect, useState } from 'react';

interface BinancePrice {
  symbol: string;
  price: string;
}

interface BinancePriceData {
  [symbol: string]: number;
}

interface BinanceContextType {
  prices: BinancePriceData;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

const BinanceContext = createContext<BinanceContextType | null>(null);

export function BinanceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<BinancePriceData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBinancePrices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('https://api.binance.com/api/v3/ticker/price');
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.statusText}`);
      }
      
      const data: BinancePrice[] = await response.json();
      
      // Convert array to object with symbol as key and price as number
      const priceMap: BinancePriceData = {};
      data.forEach(item => {
        priceMap[item.symbol] = parseFloat(item.price);
      });
      
      setPrices(priceMap);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to fetch Binance prices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBinancePrices();
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchBinancePrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const contextValue: BinanceContextType = {
    prices,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchBinancePrices,
  };

  return (
    <BinanceContext.Provider value={contextValue}>
      {children}
    </BinanceContext.Provider>
  );
}

export function useBinancePrices() {
  const context = useContext(BinanceContext);
  if (!context) {
    throw new Error('useBinancePrices must be used within a BinanceProvider');
  }
  return context;
}

// Hook pour récupérer le prix d'un symbole spécifique
export function useBinancePrice(symbol: string) {
  const { prices, isLoading, error } = useBinancePrices();
  
  return {
    price: prices[symbol] || null,
    isLoading,
    error,
    symbol,
  };
}

// Hook pour récupérer plusieurs prix en une fois
export function useBinancePricesForSymbols(symbols: string[]) {
  const { prices, isLoading, error } = useBinancePrices();
  
  const symbolPrices = symbols.reduce((acc, symbol) => {
    acc[symbol] = prices[symbol] || null;
    return acc;
  }, {} as Record<string, number | null>);
  
  return {
    prices: symbolPrices,
    isLoading,
    error,
  };
}