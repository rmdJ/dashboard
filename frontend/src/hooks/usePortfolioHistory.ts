interface PortfolioData {
  btcValue: number;
  portfolioUSD: number;
  portfolioBTC: number;
  portfolioETH: number;
  date: string;
}

const STORAGE_KEY = "portfolio_history";

export const usePortfolioHistory = () => {
  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Récupérer les données du localStorage
  const getStoredData = (): {
    today: PortfolioData | null;
    yesterday: PortfolioData | null;
  } => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { today: null, yesterday: null };

      const data = JSON.parse(stored);
      return {
        today: data.today || null,
        yesterday: data.yesterday || null,
      };
    } catch {
      return { today: null, yesterday: null };
    }
  };

  // Sauvegarder les données du jour
  const savePortfolioData = (portfolioData: Omit<PortfolioData, "date">) => {
    const todayString = getTodayString();
    const storedData = getStoredData();

    // Si on a des données today et que la date a changé, les déplacer vers yesterday
    let newYesterday = storedData.yesterday;
    if (storedData.today && storedData.today.date !== todayString) {
      newYesterday = storedData.today;
    }

    const newData = {
      today: {
        ...portfolioData,
        date: todayString,
      },
      yesterday: newYesterday,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  // Récupérer les valeurs d'hier
  const getYesterdayValues = () => {
    const { yesterday } = getStoredData();
    return yesterday
      ? {
          btcValue: yesterday.btcValue,
          portfolioUSD: yesterday.portfolioUSD,
          portfolioBTC: yesterday.portfolioBTC,
          portfolioETH: yesterday.portfolioETH,
        }
      : null;
  };

  return {
    savePortfolioData,
    getYesterdayValues,
  };
};
