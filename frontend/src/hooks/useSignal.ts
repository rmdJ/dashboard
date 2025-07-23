import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchSignalData } from "@/api/signal";

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

export function useSignalData(): UseQueryResult<SignalData[], Error> {
  return useQuery({
    queryKey: ["signal"],
    queryFn: fetchSignalData,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchInterval: 1000 * 60 * 60 * 24, // 24 hours
  });
}
