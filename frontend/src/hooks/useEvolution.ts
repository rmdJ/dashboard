import { useQuery } from "@tanstack/react-query";

export interface EvolutionDataPoint {
  date: string;
  value: number;
  _id?: string;
}

export interface EvolutionData {
  roadTo10k: EvolutionDataPoint[];
  roadTo1btc: EvolutionDataPoint[];
}

const getEvolution = async (): Promise<EvolutionData> => {
  try {
    const response = await fetch("/api/evolution");
    
    if (!response.ok) {
      throw new Error("Failed to fetch evolution data");
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "API returned error");
    }
    
    return {
      roadTo10k: result.data.roadTo10k || [],
      roadTo1btc: result.data.roadTo1btc || []
    };
    
  } catch (error) {
    console.error("Error fetching evolution data:", error);
    throw error;
  }
};

export const useEvolution = () => {
  return useQuery<EvolutionData>({
    queryKey: ["evolution"],
    queryFn: getEvolution,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};