import { useState } from "react";
import { useCinemaNextReleases } from "@/hooks/useCinemaNextReleases";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MovieDetailsDrawer } from "@/components/movie-details-drawer";
import { Calendar, Film, ChevronDown, ChevronUp } from "lucide-react";
import { MobileMovieSlider } from "./mobile-movie-slider";

export const CinemaNextReleases = () => {
  const { data, isLoading, error } = useCinemaNextReleases();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
  };

  const handleCloseDrawer = () => {
    setSelectedMovieId(null);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochaines sorties cinéma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochaines sorties cinéma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Erreur lors du chargement des données</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochaines sorties cinéma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucune sortie prévue cette semaine</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  if (!data || data.results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochaines sorties cinéma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucune sortie prévue cette semaine</p>
        </CardContent>
      </Card>
    );
  }

  const sortedMovies = data.results.sort((a, b) => b.popularity - a.popularity);

  // Calculer le nombre de films par ligne selon la breakpoint
  const getItemsPerRow = () => {
    if (typeof window === "undefined") return 6; // SSR fallback
    const width = window.innerWidth;
    if (width >= 1536) return 6; // 2xl
    if (width >= 1280) return 5; // xl
    if (width >= 1024) return 4; // lg
    return 3; // md
  };

  const itemsPerRow = getItemsPerRow();
  const moviesToShow = showAll
    ? sortedMovies
    : sortedMovies.slice(0, itemsPerRow);
  const hasMoreMovies = sortedMovies.length > itemsPerRow;

  return (
    <Card className="h-[100vh] md:h-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Prochaines sorties cinéma
        </CardTitle>
        <CardDescription>
          {data.period.isCurrentWeek ? "Cette semaine" : "Semaine prochaine"} -{" "}
          {formatDate(data.period.start)} au {formatDate(data.period.end)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile Movie Slider */}
        <MobileMovieSlider
          movies={sortedMovies}
          onMovieClick={handleMovieClick}
        />

        {/* Desktop Grid */}
        <div className="hidden md:block">
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 transition-all duration-500 ease-in-out">
            {moviesToShow.map((movie, index) => (
              <div
                key={movie.id}
                className="cursor-pointer group transition-all duration-200 hover:bg-muted/50 rounded-lg p-3 -m-3"
                style={{
                  animation:
                    showAll && index >= itemsPerRow
                      ? `slideUp 300ms ease-out ${
                          (index - itemsPerRow) * 50
                        }ms both`
                      : index < itemsPerRow
                      ? `slideUp 300ms ease-out ${index * 50}ms both`
                      : "none",
                }}
                onClick={() => handleMovieClick(movie.id)}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 flex items-center mb-3">
                    <h3 className="font-semibold text-center text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {movie.title}
                    </h3>
                  </div>
                  {movie.poster_path ? (
                    <div className="w-48 h-72 rounded-lg shadow-lg overflow-hidden">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-72 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                      <Film className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMoreMovies && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={toggleShowAll}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    Voir tous les films ({sortedMovies.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <MovieDetailsDrawer
          movieId={selectedMovieId}
          isOpen={selectedMovieId !== null}
          onClose={handleCloseDrawer}
        />
      </CardContent>
    </Card>
  );
};
