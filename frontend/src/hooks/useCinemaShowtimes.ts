import { useQuery } from "@tanstack/react-query";
import type { Movie } from "../types/cinema";

interface CinemaShowtimesResponse {
  results: Movie[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
  cinemaId: string;
  dayShift: string;
}

interface ApiResponse {
  success: boolean;
  data: CinemaShowtimesResponse;
}

const fetchCinemaShowtimes = async (
  cinemaId: string,
  dayShift: string = "0"
): Promise<CinemaShowtimesResponse> => {
  console.log(
    "Fetching cinema showtimes for",
    cinemaId,
    "with day shift",
    dayShift
  );
  const response = await fetch(
    `/api/cinema-showtimes?cinemaId=${cinemaId}&dayShift=${dayShift}`
  );
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des séances");
  }
  const result: ApiResponse = await response.json();
  return result.data;
};

export const useCinemaShowtimes = (
  cinemaId: string | null,
  dayShift: string = "0"
) => {
  return useQuery({
    queryKey: ["cinema", "showtimes", cinemaId, dayShift],
    queryFn: () => fetchCinemaShowtimes(cinemaId!, dayShift),
    enabled: !!cinemaId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
