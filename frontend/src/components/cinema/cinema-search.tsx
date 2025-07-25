import { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  Users,
  Star,
  Clock,
  Film as FilmIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { ToggleGroupSort, sortOptions } from "@/components/ui/toggle-group-sort";
import { ToggleYesNo } from "@/components/ui/toggle-yes-no";
import { MovieCard } from "./movie-card";
import { MovieDetailModal } from "./movie-detail-modal";
import { CombineMoviesPanel } from "./combine-movies-panel";
import { useMultipleCinemasShowtimes } from "../../hooks/useMultipleCinemasShowtimes";
import type { Movie, Cinema, SortOption } from "../../types/cinema";
import cinemasData from "@/data/cinemas.json";
import frenchCities from "@/data/french-cities.json";

interface CinemaSearchProps {
  selectedCity: string;
}

export function CinemaSearch({ selectedCity }: CinemaSearchProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCinemas, setSelectedCinemas] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("pressRating");
  const [shouldFilterChildrenMovies, setShouldFilterChildrenMovies] =
    useState(false);
  const [showCombinePanel, setShowCombinePanel] = useState(false);

  // Filtrer les cinémas par ville
  const availableCinemas = cinemasData.filter((cinema) => {
    // Trouver le nom de la ville correspondant à l'ID sélectionné
    const cityName = frenchCities.find(
      (city) => city.id === selectedCity
    )?.name;
    return cityName ? cinema.ville === cityName : false;
  });

  // Sélectionner automatiquement tous les cinémas au début
  useEffect(() => {
    if (availableCinemas.length > 0 && selectedCinemas.length === 0) {
      setSelectedCinemas(availableCinemas.slice(0, 3).map((c) => c.id)); // Prendre les 3 premiers
    }
  }, [availableCinemas]);

  // Calculer le dayShift (nombre de jours depuis aujourd'hui)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateCopy = new Date(selectedDate);
  selectedDateCopy.setHours(0, 0, 0, 0);
  const dayShift = Math.floor(
    (selectedDateCopy.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Récupérer les séances pour tous les cinémas sélectionnés
  const {
    data: consolidatedMovies,
    cinemaResults,
    isLoading,
    error,
  } = useMultipleCinemasShowtimes(selectedCinemas, dayShift.toString());

  // Filtrer les films pour enfants si nécessaire
  const filteredMovies = shouldFilterChildrenMovies
    ? (consolidatedMovies || []).filter((movie) =>
        (movie as any).movie.relatedTags?.some((tag: any) =>
          tag.name.startsWith("À partir de")
        ) || false
      )
    : consolidatedMovies || [];

  // Trier les films
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (sortOption) {
      case "pressRating":
        return (
          ((b as any).movie?.stats?.pressReview?.score || 0) -
          ((a as any).movie?.stats?.pressReview?.score || 0)
        );
      case "userRating":
        return (
          ((b as any).movie?.stats?.userRating?.score || 0) - 
          ((a as any).movie?.stats?.userRating?.score || 0)
        );
      case "title":
        return ((a as any).movie?.title || a.title || "").localeCompare((b as any).movie?.title || b.title || "");
      case "runtime": {
        const aRuntime = parseInt(((a as any).movie?.runtime || a.runtime || "").replace(/\D/g, "") || "0");
        const bRuntime = parseInt(((b as any).movie?.runtime || b.runtime || "").replace(/\D/g, "") || "0");
        return bRuntime - aRuntime;
      }
      default:
        return 0;
    }
  });

  // Gérer la sélection de films pour la combinaison
  const handleMovieSelect = (movie: Movie) => {
    if (selectedMovies.find((m) => m.internalId === movie.internalId)) {
      setSelectedMovies(
        selectedMovies.filter((m) => m.internalId !== movie.internalId)
      );
    } else if (selectedMovies.length < 2) {
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  // Générer les options de dates (7 prochains jours)
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const hasError = !!error;

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardContent className="flex gap-6">
          {/* Sélection de date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Select
              value={selectedDate.toISOString().split("T")[0]}
              onValueChange={(value) => setSelectedDate(new Date(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((date) => (
                  <SelectItem
                    key={date.toISOString()}
                    value={date.toISOString().split("T")[0]}
                  >
                    {date.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sélection des cinémas */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cinémas</label>
            <MultiSelect
              options={availableCinemas.map(cinema => ({
                value: cinema.id,
                label: cinema.nom
              }))}
              selected={selectedCinemas}
              onChange={setSelectedCinemas}
              placeholder="Sélectionner des cinémas..."
            />
          </div>

          {/* Options de tri */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trier par</label>
            <ToggleGroupSort
              value={sortOption}
              onChange={(value: string) => setSortOption(value as SortOption)}
              options={sortOptions}
            />
          </div>

          {/* Filtre films enfants */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Filtrer les films pour enfants</label>
            <ToggleYesNo
              value={shouldFilterChildrenMovies}
              onChange={setShouldFilterChildrenMovies}
            />
          </div>
        </CardContent>
      </Card>

      {/* Films sélectionnés pour combinaison */}
      {selectedMovies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Films sélectionnés ({selectedMovies.length}/2)
              </span>
              {selectedMovies.length === 2 && (
                <Button onClick={() => setShowCombinePanel(true)}>
                  Combiner les séances
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {selectedMovies.map((movie) => (
                <div key={movie.internalId} className="flex items-center gap-2">
                  <Badge variant="secondary">{movie.title}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMovieSelect(movie)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des films */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Chargement des séances...
          </p>
        </div>
      )}

      {hasError && (
        <div className="text-center py-8 text-destructive">
          <FilmIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Erreur lors du chargement des séances</p>
        </div>
      )}

      {!isLoading && !hasError && selectedCinemas.length > 0 && (!cinemaResults || cinemaResults.every(c => !c.data?.results?.length)) && (
        <div className="text-center py-8 text-muted-foreground">
          <FilmIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Aucun film trouvé pour les cinémas sélectionnés</p>
        </div>
      )}

      {!isLoading && !hasError && cinemaResults && (
        <div className="space-y-8">
          {cinemaResults.map((cinemaResult) => {
            const cinema = availableCinemas.find(
              (c) => c.id === cinemaResult.cinemaId
            );
            const cinemaMovies = cinemaResult.data?.results || [];

            if (cinemaMovies.length === 0) {
              return (
                <Card key={cinemaResult.cinemaId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FilmIcon className="h-5 w-5" />
                      {cinema?.nom || `Cinéma ${cinemaResult.cinemaId}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <FilmIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun film trouvé pour le cinéma {cinema?.nom || cinemaResult.cinemaId}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // Appliquer les filtres et tri pour ce cinéma
            const filteredCinemaMovies = shouldFilterChildrenMovies
              ? cinemaMovies.filter((movie) => {
                  return (movie as any).movie.relatedTags?.some((tag: any) =>
                    tag.name.startsWith("À partir de")
                  ) || false;
                })
              : cinemaMovies;

            const sortedCinemaMovies = [...filteredCinemaMovies].sort(
              (a, b) => {
                switch (sortOption) {
                  case "pressRating":
                    return (
                      ((b as any).movie?.stats?.pressReview?.score || 0) -
                      ((a as any).movie?.stats?.pressReview?.score || 0)
                    );
                  case "userRating":
                    return (
                      ((b as any).movie?.stats?.userRating?.score || 0) -
                      ((a as any).movie?.stats?.userRating?.score || 0)
                    );
                  case "title":
                    return ((a as any).movie?.title || a.title || "").localeCompare((b as any).movie?.title || b.title || "");
                  case "runtime": {
                    const aRuntime = parseInt(
                      ((a as any).movie?.runtime || a.runtime || "").replace(/\D/g, "") || "0"
                    );
                    const bRuntime = parseInt(
                      ((b as any).movie?.runtime || b.runtime || "").replace(/\D/g, "") || "0"
                    );
                    return bRuntime - aRuntime;
                  }
                  default:
                    return 0;
                }
              }
            );

            return (
              <Card key={cinemaResult.cinemaId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilmIcon className="h-5 w-5" />
                    {cinema?.nom || `Cinéma ${cinemaResult.cinemaId}`}
                  </CardTitle>
                  <CardDescription>
                    {sortedCinemaMovies.length} film
                    {sortedCinemaMovies.length > 1 ? "s" : ""} disponible
                    {sortedCinemaMovies.length > 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {sortedCinemaMovies.map((movie, index) => (
                      <MovieCard
                        key={`${cinemaResult.cinemaId}-${movie.internalId || (movie as any).movie?.internalId || index}`}
                        movie={movie}
                        isSelected={selectedMovies.some(
                          (m) => m.internalId === movie.internalId
                        )}
                        onSelect={() => handleMovieSelect(movie)}
                        onViewDetails={() => setSelectedMovie(movie)}
                        canSelect={
                          selectedMovies.length < 2 ||
                          selectedMovies.some(
                            (m) => m.internalId === movie.internalId
                          )
                        }
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Affichage consolidé si aucun résultat par cinéma */}
      {!isLoading &&
        !hasError &&
        (!cinemaResults ||
          cinemaResults.every((c) => !c.data?.results?.length)) &&
        sortedMovies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {sortedMovies.map((movie, index) => (
              <MovieCard
                key={movie.internalId || (movie as any).movie?.internalId || index}
                movie={movie}
                isSelected={selectedMovies.some(
                  (m) => m.internalId === movie.internalId
                )}
                onSelect={() => handleMovieSelect(movie)}
                onViewDetails={() => setSelectedMovie(movie)}
                canSelect={
                  selectedMovies.length < 2 ||
                  selectedMovies.some((m) => m.internalId === movie.internalId)
                }
              />
            ))}
          </div>
        )}

      {/* Modal détail du film */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          zipCode={selectedCity}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {/* Panel de combinaison */}
      {showCombinePanel && selectedMovies.length === 2 && (
        <CombineMoviesPanel
          movies={selectedMovies}
          zipCode={selectedCity}
          date={selectedDate}
          onClose={() => setShowCombinePanel(false)}
        />
      )}
    </div>
  );
}
