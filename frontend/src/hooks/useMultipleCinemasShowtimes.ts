import { useQueries } from "@tanstack/react-query";
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
  const response = await fetch(
    `/api/cinema-showtimes?cinemaId=${cinemaId}&dayShift=${dayShift}`
  );
  if (!response.ok) {
    // Pour les erreurs 4xx (cinéma non trouvé, etc.), retourner des résultats vides
    // plutôt qu'une erreur, ce qui permet à l'interface de s'afficher correctement
    if (response.status >= 400 && response.status < 500) {
      return {
        results: [],
        pagination: { currentPage: 1, totalPages: 1, totalResults: 0 },
        cinemaId,
        dayShift,
      };
    }
    throw new Error("Erreur lors de la récupération des séances");
  }
  const result: ApiResponse = await response.json();
  return result.data;
};

export const useMultipleCinemasShowtimes = (
  cinemaIds: string[],
  dayShift: string = "0"
) => {
  const queries = useQueries({
    queries: cinemaIds.map((cinemaId) => ({
      queryKey: ["cinema", "showtimes", cinemaId, dayShift],
      queryFn: () => fetchCinemaShowtimes(cinemaId, dayShift),
      enabled: !!cinemaId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    })),
  });

  // Retourner les données groupées par cinéma
  const cinemaResults = cinemaIds.map((cinemaId, index) => ({
    cinemaId,
    data: queries[index].data,
    isLoading: queries[index].isLoading,
    error: queries[index].error,
  }));

  // Consolider tous les films de tous les cinémas (pour compatibilité)
  const movieMap = new Map<number, Movie>();

  queries.forEach((query) => {
    if (query.data?.results) {
      query.data.results.forEach((movie) => {
        if (!movieMap.has(movie.internalId)) {
          movieMap.set(movie.internalId, movie);
        } else {
          // Fusionner les séances si le film existe déjà
          const existingMovie = movieMap.get(movie.internalId)!;
          Object.keys(movie.showtimes).forEach((version) => {
            const versionKey = version as keyof typeof existingMovie.showtimes;
            existingMovie.showtimes[versionKey].push(
              ...movie.showtimes[versionKey]
            );
          });
        }
      });
    }
  });

  const allMovies = Array.from(movieMap.values());

  return {
    data: allMovies, // Pour compatibilité avec le code existant
    cinemaResults, // Nouvelles données groupées par cinéma
    isLoading: queries.some((query) => query.isLoading),
    error: queries.every((query) => query.error) ? queries.find((query) => query.error)?.error || null : null,
    queries, // Pour debug si nécessaire
  };
};
