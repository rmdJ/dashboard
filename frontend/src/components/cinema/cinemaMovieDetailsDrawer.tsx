import {
  BaseMovieDetailsDrawer,
  type BaseMovieData,
} from "@/components/cinema/baseMovieDetailsDrawer";
import { Badge } from "@/components/ui/badge";
import type { Movie } from "../../types/cinema";

interface CinemaMovieDetailsDrawerProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CinemaMovieDetailsDrawer = ({
  movie,
  isOpen,
  onClose,
}: CinemaMovieDetailsDrawerProps) => {
  if (!movie) return null;

  const movieData = (movie as any).movie || movie;
  const title = movieData.title || movie.title;
  const originalTitle = movieData.originalTitle;
  const synopsis = movieData.synopsisFull || movieData.synopsis;
  const runtime = movieData.runtime || movie.runtime;
  const posterUrl = movieData.poster?.url;
  const relatedTags = movieData.relatedTags || [];

  // Extraire les notes
  const pressRating = movieData.stats?.pressReview?.score || 0;
  const pressCount = movieData.stats?.pressReview?.count || 0;
  const userRating = movieData.stats?.userRating?.score || 0;
  const userCount = movieData.stats?.userRating?.count || 0;

  // Transformer les données cinéma vers le format BaseMovieData
  const baseMovieData: BaseMovieData = {
    title,
    originalTitle: originalTitle !== title ? originalTitle : undefined,
    synopsis,
    runtime,
    posterUrl,
    relatedTags,
    ratings: {
      press:
        pressRating > 0 ? { score: pressRating, count: pressCount } : undefined,
      user:
        userRating > 0 ? { score: userRating, count: userCount } : undefined,
    },
  };

  return (
    <BaseMovieDetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      movieData={baseMovieData}
    >
      {/* Contenu spécifique aux films cinéma : Séances */}
      {movie.showtimes && (
        <div className="space-y-4">
          <h3 className="font-semibold">Séances disponibles</h3>

          {/* VF */}
          {movie.showtimes.dubbed && movie.showtimes.dubbed.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Version française (VF)
              </h4>
              <div className="flex flex-wrap gap-2">
                {movie.showtimes.dubbed.map((showtime, index) => (
                  <Badge
                    key={`vf-${index}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {new Date(showtime.startsAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* VO */}
          {movie.showtimes.original && movie.showtimes.original.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Version originale (VO)
              </h4>
              <div className="flex flex-wrap gap-2">
                {movie.showtimes.original.map((showtime, index) => (
                  <Badge
                    key={`vo-${index}`}
                    variant="outline"
                    className="text-xs"
                  >
                    {new Date(showtime.startsAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Local */}
          {movie.showtimes.local && movie.showtimes.local.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Version locale</h4>
              <div className="flex flex-wrap gap-2">
                {movie.showtimes.local.map((showtime, index) => (
                  <Badge
                    key={`local-${index}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {new Date(showtime.startsAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Multiple */}
          {movie.showtimes.multiple && movie.showtimes.multiple.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Versions multiples</h4>
              <div className="flex flex-wrap gap-2">
                {movie.showtimes.multiple.map((showtime, index) => (
                  <Badge
                    key={`multi-${index}`}
                    variant="default"
                    className="text-xs"
                  >
                    {new Date(showtime.startsAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </BaseMovieDetailsDrawer>
  );
};
