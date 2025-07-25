import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export type SignalSource =
  | "TradingView BTC.D"
  | "AppFigures Finance Rank"
  | "NewHedge MVRV Z-Score"
  | "TradingView ETH/BTC";

export interface SignalDataItem {
  source: SignalSource;
  timestamp: string;
  value: number;
}
export interface SignalData {
  _id: string;
  date: string;
  data: SignalDataItem[];
}

const fetchSignalData = async (): Promise<SignalData[]> => {
  const response = await fetch("/api/signal");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des données signal");
  }
  return response.json();
};

export function useSignalData(): UseQueryResult<SignalData[], Error> {
  return useQuery({
    queryKey: ["signal"],
    queryFn: fetchSignalData,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchInterval: 1000 * 60 * 60 * 24, // 24 hours
  });
}
