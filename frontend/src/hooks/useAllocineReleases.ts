import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface AllocineMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  
  // Champs spécifiques Allociné
  director: string;
  cast: string;
  genre: string;
  allocine_url: string;
  source: 'allocine';
  scraped_at: string;
}

interface AllocineData {
  results: AllocineMovie[];
  total_pages: number;
  total_results: number;
  page?: number;
  period: {
    start: string;
    end: string;
    isCurrentWeek: boolean;
    week: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: AllocineData;
}

const fetchAllocineReleases = async ({ pageParam = 1, queryKey }: { pageParam: number; queryKey: any[] }): Promise<AllocineData> => {
  const [, , weekOffset] = queryKey;
  const response = await fetch(`/api/allocine-releases?page=${pageParam}&week=${weekOffset}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des données Allociné");
  }
  const result: ApiResponse = await response.json();
  return result.data;
};

export const useAllocineReleases = (weekOffset: number = 0) => {
  const query = useInfiniteQuery({
    queryKey: ["allocine", "releases", weekOffset],
    queryFn: fetchAllocineReleases,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 heure
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page && lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  // Fusionner tous les résultats des pages
  const data = useMemo(() => {
    if (!query.data?.pages?.length) return null;
    
    const firstPage = query.data.pages[0];
    const allResults = query.data.pages.flatMap(page => page.results);
    
    return {
      ...firstPage,
      results: allResults,
    };
  }, [query.data]);

  return {
    data,
    isLoading: query.isLoading,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};

// Hook pour obtenir les statistiques Allociné
export const useAllocineStats = () => {
  const query = useInfiniteQuery({
    queryKey: ["allocine", "stats"],
    queryFn: async () => {
      const response = await fetch(`/api/allocine-stats`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des statistiques Allociné");
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 1000 * 60 * 60, // 1 heure
    gcTime: 1000 * 60 * 60 * 2, // 2 heures
    initialPageParam: 1,
    getNextPageParam: () => undefined, // Pas de pagination pour les stats
  });

  return {
    data: query.data?.pages?.[0],
    isLoading: query.isLoading,
    error: query.error,
  };
};