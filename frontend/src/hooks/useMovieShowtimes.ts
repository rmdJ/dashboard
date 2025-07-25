import { useQuery } from "@tanstack/react-query";
import type { Movie } from "../types/cinema";

interface Cinema {
  id: string;
  name: string;
  address: string;
  distance: string;
  showtimes: Movie["showtimes"];
}

interface MovieShowtimesResponse {
  movie: Movie;
  results: Cinema[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
  movieId: string;
  zipCode: string;
  dayShift: string;
}

interface ApiResponse {
  success: boolean;
  data: MovieShowtimesResponse;
}

const fetchMovieShowtimes = async (movieId: string, zipCode: string, dayShift: string = "0"): Promise<MovieShowtimesResponse> => {
  const response = await fetch(`/api/cinema-movie-details?movieId=${movieId}&zipCode=${zipCode}&dayShift=${dayShift}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des séances du film");
  }
  const result: ApiResponse = await response.json();
  return result.data;
};

export const useMovieShowtimes = (movieId: string | null, zipCode: string | null, dayShift: string = "0") => {
  return useQuery({
    queryKey: ["movie", "showtimes", movieId, zipCode, dayShift],
    queryFn: () => fetchMovieShowtimes(movieId!, zipCode!, dayShift),
    enabled: !!movieId && !!zipCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};