import { useQuery } from "@tanstack/react-query";

interface Genre {
  id: number;
  name: string;
}

interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

interface MovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime: number | null;
  budget: number;
  revenue: number;
  genres: Genre[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  tagline: string | null;
  status: string;
  homepage: string | null;
  imdb_id: string | null;
  adult: boolean;
  video: boolean;
}

interface ApiResponse {
  success: boolean;
  data: MovieDetails;
}

const fetchMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  const response = await fetch(`/api/movie-details?id=${movieId}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des détails du film");
  }
  const result: ApiResponse = await response.json();
  return result.data;
};

export const useMovieDetails = (movieId: number | null) => {
  return useQuery({
    queryKey: ["movie", "details", movieId],
    queryFn: () => fetchMovieDetails(movieId!),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 60, // 1 heure
    gcTime: 1000 * 60 * 60 * 2, // 2 heures
  });
};