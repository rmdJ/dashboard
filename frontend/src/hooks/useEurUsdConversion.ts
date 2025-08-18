import { useState, useEffect } from 'react';

interface ExchangeRateResponse {
  rates: {
    USD: number;
  };
}

export function useEurUsdConversion(eurAmount: number = 8880) {
  const [usdAmount, setUsdAmount] = useState<number>(9169); // Valeur par défaut actuelle
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser l'API gratuite de exchangerate-api.com
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }
        
        const data: ExchangeRateResponse = await response.json();
        const rate = data.rates.USD;
        
        setExchangeRate(rate);
        setUsdAmount(eurAmount * rate);
      } catch (err) {
        console.error('Error fetching EUR/USD exchange rate:', err);
        setError('Failed to fetch exchange rate');
        // Garder la valeur par défaut en cas d'erreur
        setUsdAmount(9169);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
    
    // Rafraîchir le taux toutes les heures
    const interval = setInterval(fetchExchangeRate, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [eurAmount]);

  return {
    usdAmount: Math.round(usdAmount), // Arrondir pour éviter les décimales
    exchangeRate,
    loading,
    error,
    eurAmount,
  };
}