import { useState, useEffect } from "react";
import {
  X,
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMovieShowtimes } from "../../hooks/useMovieShowtimes";
import type { Movie, Showtime, CombinedShowtime } from "../../types/cinema";

interface CombineMoviesPanelProps {
  movies: Movie[];
  zipCode: string;
  date: Date;
  onClose: () => void;
}

interface CinemaShowtimes {
  id: string;
  name: string;
  address: string;
  distance: string;
  showtimes: {
    dubbed: Showtime[];
    original: Showtime[];
    local: Showtime[];
    multiple: Showtime[];
  };
}

export function CombineMoviesPanel({
  movies,
  zipCode,
  date,
  onClose,
}: CombineMoviesPanelProps) {
  const [combinations, setCombinations] = useState<CombinedShowtime[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<
    "all" | "dubbed" | "original"
  >("all");

  if (movies.length !== 2) return null;

  const [firstMovie, secondMovie] = movies;

  // Calculer le dayShift
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const dayShift = Math.floor(
    (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Récupérer les séances des deux films
  const getMovieId = (movie: Movie) => {
    const movieData = (movie as any).movie || movie;
    const internalId = movie.internalId || movieData.internalId;
    return internalId?.toString() || '0';
  };

  const getMovieRuntime = (movie: Movie) => {
    const movieData = (movie as any).movie || movie;
    return movieData.runtime || movie.runtime || "";
  };

  const firstMovieShowtimes = useMovieShowtimes(
    getMovieId(firstMovie),
    zipCode,
    dayShift.toString()
  );

  const secondMovieShowtimes = useMovieShowtimes(
    getMovieId(secondMovie),
    zipCode,
    dayShift.toString()
  );

  // Calculer les combinaisons possibles
  useEffect(() => {
    if (
      !firstMovieShowtimes.data?.results ||
      !secondMovieShowtimes.data?.results
    ) {
      setCombinations([]);
      return;
    }

    const newCombinations: CombinedShowtime[] = [];
    const processedCombinations = new Set<string>();

    // Fonction pour extraire la durée en minutes du runtime
    const getMovieDurationInMinutes = (runtime: string): number => {
      const match = runtime.match(/(\d+)h?\s*(\d+)?/);
      if (match) {
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        return hours * 60 + minutes;
      }
      return 120; // Durée par défaut de 2h
    };

    const firstMovieDuration = getMovieDurationInMinutes(
      getMovieRuntime(firstMovie)
    );

    // Parcourir tous les cinémas du premier film
    firstMovieShowtimes.data.results.forEach((firstCinema: CinemaShowtimes) => {
      // Trouver le même cinéma dans les résultats du second film
      const secondCinema = secondMovieShowtimes.data!.results.find(
        (cinema: CinemaShowtimes) => cinema.id === firstCinema.id
      );

      if (!secondCinema) return;

      // Fonction pour traiter les séances d'une version
      const processVersion = (
        firstShowtimes: Showtime[],
        secondShowtimes: Showtime[]
      ) => {
        firstShowtimes.forEach((firstShowtime) => {
          const firstStartTime = new Date(firstShowtime.startsAt);
          const firstEndTime = new Date(
            firstStartTime.getTime() + (firstMovieDuration + 15) * 60000
          ); // +15min battement

          secondShowtimes.forEach((secondShowtime) => {
            const secondStartTime = new Date(secondShowtime.startsAt);

            // Calculer l'écart en minutes
            const gapMinutes =
              (secondStartTime.getTime() - firstEndTime.getTime()) /
              (1000 * 60);

            // Accepter les combinaisons avec un gap entre -20min et +120min
            if (gapMinutes >= -20 && gapMinutes <= 120) {
              const combinationKey = `${firstCinema.id}-${firstShowtime.internalId}-${secondShowtime.internalId}`;

              if (!processedCombinations.has(combinationKey)) {
                processedCombinations.add(combinationKey);

                newCombinations.push({
                  firstMovie: {
                    movie: firstMovie,
                    showtime: firstShowtime,
                    cinema: {
                      id: firstCinema.id,
                      nom: firstCinema.name,
                      adresse: firstCinema.address,
                      code_postal: "",
                      ville: "",
                    },
                  },
                  secondMovie: {
                    movie: secondMovie,
                    showtime: secondShowtime,
                    cinema: {
                      id: secondCinema.id,
                      nom: secondCinema.name,
                      adresse: secondCinema.address,
                      code_postal: "",
                      ville: "",
                    },
                  },
                  gap: Math.round(gapMinutes),
                });
              }
            }
          });
        });
      };

      // Traiter les différentes versions
      if (selectedVersion === "all" || selectedVersion === "dubbed") {
        processVersion(
          firstCinema.showtimes.dubbed || [],
          secondCinema.showtimes.dubbed || []
        );
      }

      if (selectedVersion === "all" || selectedVersion === "original") {
        processVersion(
          firstCinema.showtimes.original || [],
          secondCinema.showtimes.original || []
        );
      }
    });

    // Trier par heure de début du premier film
    newCombinations.sort((a, b) => {
      const timeA = new Date(a.firstMovie.showtime.startsAt).getTime();
      const timeB = new Date(b.firstMovie.showtime.startsAt).getTime();
      return timeA - timeB;
    });

    setCombinations(newCombinations);
  }, [
    firstMovieShowtimes.data,
    secondMovieShowtimes.data,
    selectedVersion,
    firstMovie,
    secondMovie,
  ]);

  const isLoading =
    firstMovieShowtimes.isLoading || secondMovieShowtimes.isLoading;
  const hasError = firstMovieShowtimes.error || secondMovieShowtimes.error;

  // Formater l'horaire
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formater l'écart
  const formatGap = (minutes: number) => {
    if (minutes < 0) {
      return `${Math.abs(minutes)}min de chevauchement`;
    } else if (minutes === 0) {
      return "Enchaînement direct";
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0) {
        return `${hours}h${
          mins > 0 ? mins.toString().padStart(2, "0") : ""
        } d'attente`;
      } else {
        return `${mins}min d'attente`;
      }
    }
  };

  return (
    <Sheet open={true} onOpenChange={() => onClose()}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Combinaisons de séances</SheetTitle>
              <SheetDescription>
                Trouvez les meilleures combinaisons pour voir vos deux films le{" "}
                {date.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </SheetDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Films sélectionnés */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {((firstMovie as any).movie?.title || firstMovie.title)}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">
              {((secondMovie as any).movie?.title || secondMovie.title)}
            </Badge>
          </div>
        </div>

        {/* Filtres */}
        <Tabs
          value={selectedVersion}
          onValueChange={(value: any) => setSelectedVersion(value)}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">Toutes les versions</TabsTrigger>
            <TabsTrigger value="dubbed">VF uniquement</TabsTrigger>
            <TabsTrigger value="original">VO uniquement</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Résultats */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Calcul des combinaisons...
              </p>
            </div>
          )}

          {hasError && (
            <div className="text-center py-8 text-destructive">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Erreur lors du chargement des séances</p>
            </div>
          )}

          {!isLoading && !hasError && combinations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune combinaison trouvée</p>
              <p className="text-sm mt-1">
                Essayez de sélectionner une autre date ou d'autres films
              </p>
            </div>
          )}

          {!isLoading && !hasError && combinations.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                {combinations.length} combinaison
                {combinations.length > 1 ? "s" : ""} trouvée
                {combinations.length > 1 ? "s" : ""}
              </div>

              {combinations.map((combination, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {combination.firstMovie.cinema.nom}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">
                          {combination.firstMovie.cinema.adresse}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Première séance */}
                      <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {((firstMovie as any).movie?.title || firstMovie.title)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getMovieRuntime(firstMovie)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatTime(
                              combination.firstMovie.showtime.startsAt
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {combination.firstMovie.showtime.diffusionVersion ||
                              "VF"}
                          </Badge>
                        </div>
                      </div>

                      {/* Écart */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatGap(combination.gap)}</span>
                        </div>
                      </div>

                      {/* Deuxième séance */}
                      <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {((secondMovie as any).movie?.title || secondMovie.title)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getMovieRuntime(secondMovie)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatTime(
                              combination.secondMovie.showtime.startsAt
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {combination.secondMovie.showtime
                              .diffusionVersion || "VF"}
                          </Badge>
                        </div>
                      </div>

                      {/* Indicateur de qualité de la combinaison */}
                      {combination.gap < 0 && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Attention : les films se chevauchent</span>
                        </div>
                      )}

                      {combination.gap > 180 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Longue attente entre les films</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
