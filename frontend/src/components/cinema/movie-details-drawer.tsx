import { useMovieDetails } from "@/hooks/useMovieDetails";
import { BaseMovieDetailsDrawer, type BaseMovieData } from "@/components/common/base-movie-details-drawer";
import { Badge } from "@/components/ui/badge";

interface MovieDetailsDrawerProps {
  movieId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MovieDetailsDrawer = ({ movieId, isOpen, onClose }: MovieDetailsDrawerProps) => {
  const { data: movie, isLoading, error } = useMovieDetails(movieId);

  // Transformer les données TMDb vers le format BaseMovieData
  const movieData: BaseMovieData | null = movie ? {
    title: movie.title,
    originalTitle: movie.original_title !== movie.title ? movie.original_title : undefined,
    synopsis: movie.overview,
    runtime: movie.runtime,
    posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : undefined,
    releaseDate: movie.release_date,
    genres: movie.genres,
    ratings: {
      tmdb: movie.vote_average,
    },
    budget: movie.budget,
    revenue: movie.revenue,
    popularity: movie.popularity,
    voteCount: movie.vote_count,
  } : null;

  return (
    <BaseMovieDetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      isLoading={isLoading}
      error={!!error}
      movieData={movieData}
    >
      {/* Contenu spécifique aux films TMDb */}
      {movie?.production_companies && movie.production_companies.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Production</h3>
          <div className="flex flex-wrap gap-2">
            {movie.production_companies.map((company) => (
              <Badge key={company.id} variant="outline" className="text-xs">
                {company.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </BaseMovieDetailsDrawer>
  );
};