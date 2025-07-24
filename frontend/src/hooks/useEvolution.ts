import { useQuery } from "@tanstack/react-query";
import { getEvolution, type EvolutionData } from "@/api/evolution";

export const useEvolution = () => {
  return useQuery<EvolutionData>({
    queryKey: ["evolution"],
    queryFn: getEvolution,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};