import { useState, useEffect } from "react";
import { Film, X, ArrowRight, Clock, MapPin, Calendar, AlertCircle } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useMovieShowtimes } from "../../hooks/useMovieShowtimes";
import type { Movie, Showtime, CombinedShowtime } from "../../types/cinema";

interface SelectedMoviesDrawerProps {
  movies: Movie[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveMovie: (movie: Movie, cinemaId?: string) => void;
  zipCode: string;
  date: Date;
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

interface MovieWithTiming {
  movie: Movie;
  cinema: {
    id: string;
    nom: string;
    adresse: string;
    code_postal: string;
    ville: string;
  };
  showtime: Showtime;
  startTime: Date;
  endTime: Date;
}

export const SelectedMoviesDrawer = ({
  movies,
  isOpen,
  onClose,
  onRemoveMovie,
  zipCode,
  date,
}: SelectedMoviesDrawerProps) => {
  const [combinations, setCombinations] = useState<CombinedShowtime[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<"all" | "vf" | "original">("all");

  // Fonctions utilitaires
  const getMovieId = (movie: Movie) => {
    const movieData = (movie as any).movie || movie;
    const internalId = movie.internalId || movieData.internalId;
    return internalId?.toString() || '0';
  };

  const getMovieRuntime = (movie: Movie) => {
    const movieData = (movie as any).movie || movie;
    return movieData.runtime || movie.runtime || "";
  };

  // Fonction pour extraire la durée en minutes du runtime (identique à l'original)
  const getRuntimeInMinutes = (runtime: string): number => {
    const match = runtime.match(/(\d+)h\s*(\d*)min?/);
    if (match) {
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  // Calculer le dayShift
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const dayShift = Math.floor(
    (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Récupérer les séances des deux films (seulement si on a 2 films)
  const firstMovie = movies[0];
  const secondMovie = movies[1];

  const firstMovieShowtimes = useMovieShowtimes(
    movies.length >= 1 ? getMovieId(firstMovie) : null,
    zipCode,
    dayShift.toString()
  );

  const secondMovieShowtimes = useMovieShowtimes(
    movies.length >= 2 ? getMovieId(secondMovie) : null,
    zipCode,
    dayShift.toString()
  );

  // Calculer les combinaisons possibles (basé sur la logique originale)
  useEffect(() => {
    if (movies.length !== 2) {
      setCombinations([]);
      return;
    }

    // Vérifier si les films ont des séances disponibles
    const firstMovieHasShowtimes = firstMovie.showtimes && (
      (firstMovie.showtimes.dubbed && firstMovie.showtimes.dubbed.length > 0) ||
      (firstMovie.showtimes.original && firstMovie.showtimes.original.length > 0) ||
      (firstMovie.showtimes.local && firstMovie.showtimes.local.length > 0) ||
      (firstMovie.showtimes.multiple && firstMovie.showtimes.multiple.length > 0)
    );

    const secondMovieHasShowtimes = secondMovie.showtimes && (
      (secondMovie.showtimes.dubbed && secondMovie.showtimes.dubbed.length > 0) ||
      (secondMovie.showtimes.original && secondMovie.showtimes.original.length > 0) ||
      (secondMovie.showtimes.local && secondMovie.showtimes.local.length > 0) ||
      (secondMovie.showtimes.multiple && secondMovie.showtimes.multiple.length > 0)
    );

    if (!firstMovieHasShowtimes || !secondMovieHasShowtimes) {
      console.log('Movies do not have showtimes available');
      setCombinations([]);
      return;
    }


    // Aplatir toutes les séances de tous les films de tous les cinémas (comme l'original)
    const allMoviesWithTimes: MovieWithTiming[] = [];

    console.log('=== DEBUG COMBINATION LOGIC ===');
    console.log('First movie:', firstMovie);
    console.log('Second movie:', secondMovie);
    console.log('First movie runtime:', getMovieRuntime(firstMovie));
    console.log('Second movie runtime:', getMovieRuntime(secondMovie));
    console.log('=== API DATA ===');
    console.log('firstMovieShowtimes.data:', firstMovieShowtimes.data);
    console.log('secondMovieShowtimes.data:', secondMovieShowtimes.data);

    // Traiter le premier film (utiliser directement les séances du film)
    const firstMovieRuntime = getRuntimeInMinutes(getMovieRuntime(firstMovie));
    console.log(`First movie runtime in minutes: ${firstMovieRuntime}`);
    
    if (firstMovieRuntime > 0) {
      const processFirstMovieShowtimes = (showtimes: Showtime[], versionType: string) => {
        console.log(`Processing ${showtimes.length} ${versionType} showtimes for first movie`);
        showtimes.forEach((showtime) => {
          if (showtime && showtime.startsAt) {
            const startTime = new Date(showtime.startsAt);
            // Ajouter 15 minutes de battement comme dans l'original (TRAILER_DELAY_MINUTES)
            const endTime = new Date(startTime.getTime() + (firstMovieRuntime + 15) * 60000);
            
            console.log(`First movie ${versionType} showtime: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`);
            
            allMoviesWithTimes.push({
              movie: firstMovie,
              cinema: {
                id: (firstMovie as any).cinemaId || "unknown",
                nom: "Cinema",
                adresse: "",
                code_postal: "",
                ville: "",
              },
              showtime,
              startTime,
              endTime,
            });
          }
        });
      };

      // Traiter selon la version sélectionnée (dubbed + local = VF)
      if (selectedVersion === "all" || selectedVersion === "vf") {
        processFirstMovieShowtimes(firstMovie.showtimes.dubbed || [], "VF");
        processFirstMovieShowtimes(firstMovie.showtimes.local || [], "VF");
      }
      if (selectedVersion === "all" || selectedVersion === "original") {
        processFirstMovieShowtimes(firstMovie.showtimes.original || [], "VO");
      }
      // Traiter les séances "multiple" uniquement pour "all"
      if (selectedVersion === "all") {
        processFirstMovieShowtimes(firstMovie.showtimes.multiple || [], "Multiple");
      }
    }

    // Traiter le deuxième film (utiliser directement les séances du film)
    const secondMovieRuntime = getRuntimeInMinutes(getMovieRuntime(secondMovie));
    console.log(`Second movie runtime in minutes: ${secondMovieRuntime}`);
    
    if (secondMovieRuntime > 0) {
      const processSecondMovieShowtimes = (showtimes: Showtime[], versionType: string) => {
        console.log(`Processing ${showtimes.length} ${versionType} showtimes for second movie`);
        showtimes.forEach((showtime) => {
          if (showtime && showtime.startsAt) {
            const startTime = new Date(showtime.startsAt);
            // Ajouter 15 minutes de battement comme dans l'original (TRAILER_DELAY_MINUTES)
            const endTime = new Date(startTime.getTime() + (secondMovieRuntime + 15) * 60000);
            
            console.log(`Second movie ${versionType} showtime: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`);
            
            allMoviesWithTimes.push({
              movie: secondMovie,
              cinema: {
                id: (secondMovie as any).cinemaId || "unknown",
                nom: "Cinema",
                adresse: "",
                code_postal: "",
                ville: "",
              },
              showtime,
              startTime,
              endTime,
            });
          }
        });
      };

      // Traiter selon la version sélectionnée (dubbed + local = VF)
      if (selectedVersion === "all" || selectedVersion === "vf") {
        processSecondMovieShowtimes(secondMovie.showtimes.dubbed || [], "VF");
        processSecondMovieShowtimes(secondMovie.showtimes.local || [], "VF");
      }
      if (selectedVersion === "all" || selectedVersion === "original") {
        processSecondMovieShowtimes(secondMovie.showtimes.original || [], "VO");
      }
      // Traiter les séances "multiple" uniquement pour "all"
      if (selectedVersion === "all") {
        processSecondMovieShowtimes(secondMovie.showtimes.multiple || [], "Multiple");
      }
    }

    // Trier tous les films par heure de début (comme l'original)
    allMoviesWithTimes.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    console.log(`Total movies with times found: ${allMoviesWithTimes.length}`);
    allMoviesWithTimes.forEach((movie, index) => {
      console.log(`${index}: ${movie.cinema.nom} - ${getMovieId(movie.movie)} - ${movie.startTime.toLocaleTimeString()} to ${movie.endTime.toLocaleTimeString()}`);
    });

    // Générer les combinaisons (logique identique à l'original)
    const newCombinations: CombinedShowtime[] = [];
    const uniqueCombinations = new Set<string>();

    for (let i = 0; i < allMoviesWithTimes.length; i++) {
      const firstMovieWithTime = allMoviesWithTimes[i];

      for (let j = i + 1; j < allMoviesWithTimes.length; j++) {
        const secondMovieWithTime = allMoviesWithTimes[j];

        // Skip si même film (comme l'original)
        if (getMovieId(firstMovieWithTime.movie) === getMovieId(secondMovieWithTime.movie)) {
          console.log(`Skipping same movie: ${getMovieId(firstMovieWithTime.movie)} === ${getMovieId(secondMovieWithTime.movie)}`);
          continue;
        }

        // Calculer l'écart entre les films (comme l'original)
        const gapMinutes = (secondMovieWithTime.startTime.getTime() - firstMovieWithTime.endTime.getTime()) / (1000 * 60);

        console.log(`Checking combination: Movie ${getMovieId(firstMovieWithTime.movie)} (${firstMovieWithTime.startTime.toLocaleTimeString()}-${firstMovieWithTime.endTime.toLocaleTimeString()}) + Movie ${getMovieId(secondMovieWithTime.movie)} (${secondMovieWithTime.startTime.toLocaleTimeString()}) = Gap: ${gapMinutes.toFixed(1)} minutes`);

        // Vérifier s'il y a au moins -20 minutes entre les films (comme l'original)
        // L'original utilise gap >= -20 car il ajoute déjà 15min au temps de fin
        if (gapMinutes >= -20) {
          console.log(`✅ Valid combination found! Gap: ${gapMinutes.toFixed(1)} minutes`);
          
          // Générer une clé unique (comme l'original)
          const combinationKey = `${getMovieId(firstMovieWithTime.movie)}_${firstMovieWithTime.startTime.getHours()}:${firstMovieWithTime.startTime.getMinutes().toString().padStart(2, '0')}_${getMovieId(secondMovieWithTime.movie)}_${secondMovieWithTime.startTime.getHours()}:${secondMovieWithTime.startTime.getMinutes().toString().padStart(2, '0')}`;

          if (!uniqueCombinations.has(combinationKey)) {
            uniqueCombinations.add(combinationKey);

            newCombinations.push({
              firstMovie: {
                movie: firstMovieWithTime.movie,
                showtime: firstMovieWithTime.showtime,
                cinema: firstMovieWithTime.cinema,
              },
              secondMovie: {
                movie: secondMovieWithTime.movie,
                showtime: secondMovieWithTime.showtime,
                cinema: secondMovieWithTime.cinema,
              },
              gap: Math.round(gapMinutes),
            });
          } else {
            console.log(`❌ Duplicate combination skipped: ${combinationKey}`);
          }
        } else {
          console.log(`❌ Gap too small: ${gapMinutes.toFixed(1)} < -20 minutes`);
        }
      }
    }

    console.log(`Final combinations found: ${newCombinations.length}`);
    setCombinations(newCombinations);
  }, [
    selectedVersion,
    firstMovie,
    secondMovie,
    movies.length,
  ]);

  // Fonctions de formatage
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const isLoading = firstMovieShowtimes.isLoading || secondMovieShowtimes.isLoading;
  const hasError = firstMovieShowtimes.error || secondMovieShowtimes.error;
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </DrawerClose>

          <DrawerHeader>
            <DrawerTitle className="text-center">
              Films sélectionnés ({movies.length}/2)
            </DrawerTitle>
          </DrawerHeader>

          <div className="overflow-y-auto max-h-[75vh] p-6 space-y-6">
            {/* Films sélectionnés */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {movies.map((movie, index) => {
                const movieData = (movie as any).movie || movie;
                const title = movieData.title || movie.title;
                const posterUrl = movieData.poster?.url;
                const cinemaId = (movie as any).cinemaId;

                return (
                  <div key={`${cinemaId}-${getMovieId(movie)}-${title}`} className="flex items-center gap-3">
                    {index > 0 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    
                    <div className="flex items-center gap-3">
                      {/* Poster */}
                      <div className="flex-shrink-0">
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt={title}
                            className="w-12 h-18 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-18 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            <Film className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Détails du film */}
                      <div>
                        <h3 className="font-semibold text-sm">{title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {getMovieRuntime(movie)}
                        </p>
                      </div>

                      {/* Bouton de suppression */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMovie(movie, cinemaId)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Combinaisons possibles */}
            {movies.length === 2 && (
              <>
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Combinaisons possibles pour le {date.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h3>

                  {/* Filtres de version */}
                  <Tabs
                    value={selectedVersion}
                    onValueChange={(value: any) => setSelectedVersion(value)}
                    className="mb-6"
                  >
                    <TabsList>
                      <TabsTrigger value="all">Toutes les versions</TabsTrigger>
                      <TabsTrigger value="vf">VF uniquement</TabsTrigger>
                      <TabsTrigger value="original">VO uniquement</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Résultats des combinaisons */}
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
                                    {formatTime(combination.firstMovie.showtime.startsAt)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Fin: {(() => {
                                      const startTime = new Date(combination.firstMovie.showtime.startsAt);
                                      const runtime = getRuntimeInMinutes(getMovieRuntime(firstMovie));
                                      const endTime = new Date(startTime.getTime() + (runtime + 20) * 60000);
                                      return endTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                                    })()}
                                  </div>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {(() => {
                                      const version = combination.firstMovie.showtime.diffusionVersion;
                                      if (version === "ORIGINAL") return "VO";
                                      if (version === "DUBBED") return "VF";
                                      if (version === "LOCAL") return "VF";
                                      return "VF";
                                    })()}
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
                                    {formatTime(combination.secondMovie.showtime.startsAt)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Fin: {(() => {
                                      const startTime = new Date(combination.secondMovie.showtime.startsAt);
                                      const runtime = getRuntimeInMinutes(getMovieRuntime(secondMovie));
                                      const endTime = new Date(startTime.getTime() + (runtime + 20) * 60000);
                                      return endTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                                    })()}
                                  </div>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {(() => {
                                      const version = combination.secondMovie.showtime.diffusionVersion;
                                      if (version === "ORIGINAL") return "VO";
                                      if (version === "DUBBED") return "VF";
                                      if (version === "LOCAL") return "VF";
                                      return "VF";
                                    })()}
                                  </Badge>
                                </div>
                              </div>

                              {/* Indicateurs de qualité */}
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
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};