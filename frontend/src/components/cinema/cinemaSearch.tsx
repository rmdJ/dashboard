import { useState, useEffect, useRef } from "react";
import { Film as FilmIcon, ChevronUp } from "lucide-react";
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
import { MultiSelect } from "@/components/ui/multi-select";
import {
  ToggleGroupSort,
  sortOptions,
} from "@/components/ui/toggle-group-sort";
import { ToggleYesNo } from "@/components/ui/toggle-yes-no";
import { MovieCard } from "./movieCard";
import { SelectedMoviesDrawer } from "./selectedMoviesDrawer";
import { useMultipleCinemasShowtimes } from "../../hooks/useMultipleCinemasShowtimes";
import type { Movie, SortOption } from "../../types/cinema";
import cinemasData from "@/data/cinemas.json";
import frenchCities from "@/data/french-cities.json";

interface CinemaSearchProps {
  selectedCity: string;
}

export function CinemaSearch({ selectedCity }: CinemaSearchProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCinemas, setSelectedCinemas] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("userRating");
  const [shouldFilterChildrenMovies, setShouldFilterChildrenMovies] =
    useState(false);
  const [showSelectedMoviesDrawer, setShowSelectedMoviesDrawer] =
    useState(false);
  const [isClosingDrawer, setIsClosingDrawer] = useState(false);

  // Filtrer les cinémas par ville
  const availableCinemas = cinemasData.filter((cinema) => {
    // Trouver le nom de la ville correspondant à l'ID sélectionné
    const cityName = frenchCities.find(
      (city) => city.id === selectedCity
    )?.name;
    return cityName ? cinema.ville === cityName : false;
  });

  // Sélectionner automatiquement les cinémas quand la ville change
  useEffect(() => {
    if (availableCinemas.length > 0) {
      setSelectedCinemas(availableCinemas.map((c) => c.id));
    } else {
      setSelectedCinemas([]);
    }
  }, [selectedCity]); // Se déclenche uniquement quand la ville change

  // Sélectionner automatiquement au premier chargement si aucun cinéma n'est sélectionné
  useEffect(() => {
    if (availableCinemas.length > 0 && selectedCinemas.length === 0) {
      setSelectedCinemas(availableCinemas.map((c) => c.id));
    }
  }, [availableCinemas.length]); // Se déclenche uniquement quand le nombre de cinémas change

  // Refs pour accéder aux valeurs actuelles dans l'event listener
  const showDrawerRef = useRef(showSelectedMoviesDrawer);
  const selectedMoviesRef = useRef(selectedMovies);
  
  // Mettre à jour les refs
  useEffect(() => {
    showDrawerRef.current = showSelectedMoviesDrawer;
  }, [showSelectedMoviesDrawer]);
  
  useEffect(() => {
    selectedMoviesRef.current = selectedMovies;
  }, [selectedMovies]);

  // Gérer la touche Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showDrawerRef.current) {
          // Si le drawer est ouvert, le fermer seulement
          setIsClosingDrawer(true);
          setShowSelectedMoviesDrawer(false);
          // Remettre le flag à false après un délai
          setTimeout(() => setIsClosingDrawer(false), 100);
        } else if (selectedMoviesRef.current.length > 0 && !isClosingDrawer) {
          // Si le drawer est fermé et qu'il y a des films sélectionnés, les désélectionner
          setSelectedMovies([]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isClosingDrawer]); // Dépendance sur isClosingDrawer

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
    ? (consolidatedMovies || []).filter(
        (movie) =>
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
        return ((a as any).movie?.title || a.title || "").localeCompare(
          (b as any).movie?.title || b.title || ""
        );
      case "runtime": {
        const aRuntime = parseInt(
          ((a as any).movie?.runtime || a.runtime || "").replace(/\D/g, "") ||
            "0"
        );
        const bRuntime = parseInt(
          ((b as any).movie?.runtime || b.runtime || "").replace(/\D/g, "") ||
            "0"
        );
        return bRuntime - aRuntime;
      }
      default:
        return 0;
    }
  });

  // Générer une clé unique pour chaque film incluant le cinéma
  const getMovieKey = (movie: Movie, cinemaId?: string) => {
    const movieData = (movie as any).movie || movie;
    const title = movieData.title || movie.title;
    return `${cinemaId || "unknown"}-${
      movie.internalId || movieData.internalId
    }-${title}`;
  };

  // Gérer la sélection de films pour la combinaison
  const handleMovieSelect = (movie: Movie, cinemaId?: string) => {
    const movieKey = getMovieKey(movie, cinemaId);

    if (
      selectedMovies.find(
        (m) => getMovieKey(m, (m as any).cinemaId) === movieKey
      )
    ) {
      setSelectedMovies(
        selectedMovies.filter(
          (m) => getMovieKey(m, (m as any).cinemaId) !== movieKey
        )
      );
    } else if (selectedMovies.length < 2) {
      // Ajouter l'ID du cinéma au film sélectionné pour référence future
      const movieWithCinema = { ...movie, cinemaId } as Movie & {
        cinemaId?: string;
      };
      setSelectedMovies([...selectedMovies, movieWithCinema]);
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
    <div className="space-y-6 relative">
      {/* Filtres */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-6">
          {/* Sélection de date */}
          <div className="space-y-2 w-full md:w-auto">
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
          <div className="space-y-2 w-full md:w-auto">
            <label className="text-sm font-medium">Cinémas</label>
            <MultiSelect
              options={availableCinemas.map((cinema) => ({
                value: cinema.id,
                label: cinema.nom,
              }))}
              selected={selectedCinemas}
              onChange={setSelectedCinemas}
              placeholder="Sélectionner des cinémas..."
            />
          </div>

          {/* Options de tri */}
          <div className="space-y-2 w-full md:w-auto">
            <label className="text-sm font-medium">Trier par</label>
            <ToggleGroupSort
              value={sortOption}
              onChange={(value: string) => setSortOption(value as SortOption)}
              options={sortOptions}
            />
          </div>

          {/* Filtre films enfants */}
          <div className="space-y-2 w-full md:w-auto">
            <label className="text-sm font-medium">Films enfants</label>
            <ToggleYesNo
              value={shouldFilterChildrenMovies}
              onChange={setShouldFilterChildrenMovies}
            />
          </div>
        </CardContent>
      </Card>

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

      {!isLoading &&
        !hasError &&
        selectedCinemas.length > 0 &&
        (!cinemaResults ||
          cinemaResults.every((c) => !c.data?.results?.length)) && (
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
                      <p>
                        Aucun film trouvé pour le cinéma{" "}
                        {cinema?.nom || cinemaResult.cinemaId}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // Appliquer les filtres et tri pour ce cinéma
            const filteredCinemaMovies = shouldFilterChildrenMovies
              ? cinemaMovies.filter((movie) => {
                  return (
                    (movie as any).movie.relatedTags?.some((tag: any) =>
                      tag.name.startsWith("À partir de")
                    ) || false
                  );
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
                    return (
                      (a as any).movie?.title ||
                      a.title ||
                      ""
                    ).localeCompare((b as any).movie?.title || b.title || "");
                  case "runtime": {
                    const aRuntime = parseInt(
                      ((a as any).movie?.runtime || a.runtime || "").replace(
                        /\D/g,
                        ""
                      ) || "0"
                    );
                    const bRuntime = parseInt(
                      ((b as any).movie?.runtime || b.runtime || "").replace(
                        /\D/g,
                        ""
                      ) || "0"
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
                  {/* Version desktop : grille */}
                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {sortedCinemaMovies.map((movie, index) => (
                      <MovieCard
                        key={`${cinemaResult.cinemaId}-${
                          movie.internalId ||
                          (movie as any).movie?.internalId ||
                          index
                        }`}
                        movie={movie}
                        isSelected={selectedMovies.some(
                          (m) =>
                            getMovieKey(m, (m as any).cinemaId) ===
                            getMovieKey(movie, cinemaResult.cinemaId)
                        )}
                        onSelect={() =>
                          handleMovieSelect(movie, cinemaResult.cinemaId)
                        }
                        canSelect={
                          selectedMovies.length < 2 ||
                          selectedMovies.some(
                            (m) =>
                              getMovieKey(m, (m as any).cinemaId) ===
                              getMovieKey(movie, cinemaResult.cinemaId)
                          )
                        }
                      />
                    ))}
                  </div>

                  {/* Version mobile : slider horizontal */}
                  <div className="md:hidden">
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                      {sortedCinemaMovies.map((movie, index) => (
                        <div
                          key={`${cinemaResult.cinemaId}-${
                            movie.internalId ||
                            (movie as any).movie?.internalId ||
                            index
                          }`}
                          className="flex-shrink-0 w-48"
                        >
                          <MovieCard
                            movie={movie}
                            isSelected={selectedMovies.some(
                              (m) =>
                                getMovieKey(m, (m as any).cinemaId) ===
                                getMovieKey(movie, cinemaResult.cinemaId)
                            )}
                            onSelect={() =>
                              handleMovieSelect(movie, cinemaResult.cinemaId)
                            }
                            canSelect={
                              selectedMovies.length < 2 ||
                              selectedMovies.some(
                                (m) => m.internalId === movie.internalId
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
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
          <div>
            {/* Version desktop : grille */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {sortedMovies.map((movie, index) => (
                <MovieCard
                  key={
                    movie.internalId ||
                    (movie as any).movie?.internalId ||
                    index
                  }
                  movie={movie}
                  isSelected={selectedMovies.some(
                    (m) => m.internalId === movie.internalId
                  )}
                  onSelect={() => handleMovieSelect(movie)}
                  canSelect={
                    selectedMovies.length < 2 ||
                    selectedMovies.some(
                      (m) => m.internalId === movie.internalId
                    )
                  }
                />
              ))}
            </div>

            {/* Version mobile : slider horizontal */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                {sortedMovies.map((movie, index) => (
                  <div
                    key={
                      movie.internalId ||
                      (movie as any).movie?.internalId ||
                      index
                    }
                    className="flex-shrink-0 w-48"
                  >
                    <MovieCard
                      movie={movie}
                      isSelected={selectedMovies.some(
                        (m) => m.internalId === movie.internalId
                      )}
                      onSelect={() => handleMovieSelect(movie)}
                      canSelect={
                        selectedMovies.length < 2 ||
                        selectedMovies.some(
                          (m) => m.internalId === movie.internalId
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Pill flottant pour films sélectionnés */}
      {selectedMovies.length === 2 && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 px-4">
          <Button
            onClick={() => setShowSelectedMoviesDrawer(true)}
            className="shadow-lg hover:shadow-xl transition-shadow duration-200"
            size="lg"
          >
            <ChevronUp className="h-4 w-4 mr-2" />
            Voir les combinaisons
          </Button>
        </div>
      )}

      {/* Drawer des films sélectionnés */}
      <SelectedMoviesDrawer
        movies={selectedMovies}
        isOpen={showSelectedMoviesDrawer}
        onClose={() => {
          setIsClosingDrawer(true);
          setShowSelectedMoviesDrawer(false);
          // Remettre le flag à false après un délai
          setTimeout(() => setIsClosingDrawer(false), 100);
        }}
        onRemoveMovie={(movie, cinemaId) => handleMovieSelect(movie, cinemaId)}
        zipCode={selectedCity}
        date={selectedDate}
      />
    </div>
  );
}
