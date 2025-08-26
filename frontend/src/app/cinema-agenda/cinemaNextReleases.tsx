import { useState } from "react";
import { useCinemaNextReleases } from "@/hooks/useCinemaNextReleases";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SingleSelect } from "@/components/ui/single-select";
import { MovieDetailsDrawer } from "@/components/cinema/movieDetailsDrawer";
import { Calendar, Film, ChevronRight } from "lucide-react";

export const CinemaNextReleases = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCinemaNextReleases(selectedWeek);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
  };

  const handleCloseDrawer = () => {
    setSelectedMovieId(null);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
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
        <CardContent className="pt-6">
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

  const weekOptions = [
    { value: "0", label: "Semaine prochaine" },
    { value: "1", label: "Semaine +2" },
    { value: "2", label: "Semaine +3" },
    { value: "3", label: "Semaine +4" },
    { value: "4", label: "Semaine +5" },
    { value: "5", label: "Semaine +6" },
    { value: "6", label: "Semaine +7" },
    { value: "7", label: "Semaine +8" },
  ];

  const handleWeekChange = (value: string) => {
    setSelectedWeek(parseInt(value));
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

  return (
    <Card className="h-[100vh] md:h-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formatDate(data.period.start)} au {formatDate(data.period.end)}
          </CardTitle>
          <div className="w-48">
            <SingleSelect
              options={weekOptions}
              value={selectedWeek.toString()}
              onChange={handleWeekChange}
              placeholder="Choisir la semaine"
              enableSearch={false}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Version mobile : slider horizontal */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {sortedMovies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-48">
                <div
                  className="cursor-pointer group transition-all duration-200 hover:bg-muted/50 rounded-lg p-3 -m-3"
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
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:block">
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {sortedMovies.map((movie) => (
              <div
                key={movie.id}
                className="cursor-pointer group transition-all duration-200 hover:bg-muted/50 rounded-lg p-3 -m-3"
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

          {hasNextPage && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                {isFetchingNextPage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Chargement...
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                    Voir plus de films
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
