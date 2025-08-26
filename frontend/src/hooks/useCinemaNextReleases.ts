import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

interface CinemaData {
  results: Movie[];
  total_pages: number;
  total_results: number;
  page?: number;
  period: {
    start: string;
    end: string;
    isCurrentWeek: boolean;
  };
}

interface ApiResponse {
  success: boolean;
  data: CinemaData;
}

const fetchCinemaNextReleases = async ({ pageParam = 1, queryKey }: { pageParam: number; queryKey: any[] }): Promise<CinemaData> => {
  const [, , weekOffset] = queryKey;
  const response = await fetch(`/api/cinema-releases?page=${pageParam}&week=${weekOffset}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des données");
  }
  const result: ApiResponse = await response.json();
  return result.data;
};

export const useCinemaNextReleases = (weekOffset: number = 0) => {
  const query = useInfiniteQuery({
    queryKey: ["cinema", "next-releases", weekOffset],
    queryFn: fetchCinemaNextReleases,
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