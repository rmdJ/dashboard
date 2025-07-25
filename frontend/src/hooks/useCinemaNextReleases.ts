import { useQuery } from "@tanstack/react-query";

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

const fetchCinemaNextReleases = async (): Promise<CinemaData> => {
  const response = await fetch("/api/cinema/next-release");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des données");
  }
  const result: ApiResponse = await response.json();
  return result.data;
};

export const useCinemaNextReleases = () => {
  return useQuery({
    queryKey: ["cinema", "next-releases"],
    queryFn: fetchCinemaNextReleases,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 heure
  });
};