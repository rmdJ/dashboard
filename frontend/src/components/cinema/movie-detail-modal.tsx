import { useState } from "react";
import {
  X,
  Star,
  Clock,
  Calendar,
  MapPin,
  ExternalLink,
  Film,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMovieShowtimes } from "../../hooks/useMovieShowtimes";
import type { Movie, Showtime } from "../../types/cinema";

interface Version {
  label: string;
  key: string;
  showtimes: Showtime[];
}

interface MovieDetailModalProps {
  movie: Movie | null;
  zipCode: string;
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

export function MovieDetailModal({
  movie,
  zipCode,
  onClose,
}: MovieDetailModalProps) {
  const [selectedDate, setSelectedDate] = useState(0); // dayShift
  const [imageError, setImageError] = useState(false);

  const {
    data: movieShowtimes,
    isLoading,
    error,
  } = useMovieShowtimes(
    movie?.internalId?.toString() || null,
    zipCode,
    selectedDate.toString()
  );

  if (!movie) return null;

  // Générer les options de dates (7 prochains jours)
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      dayShift: i,
      date: date,
      label: date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    };
  });

  // Formater les horaires par version
  const formatShowtimesByVersion = (showtimes: {
    [key: string]: Showtime[];
  }) => {
    const versions: Version[] = [];

    if (showtimes.dubbed?.length > 0) {
      versions.push({
        label: "Version française (VF)",
        key: "dubbed",
        showtimes: showtimes.dubbed,
      });
    }

    if (showtimes.original?.length > 0) {
      versions.push({
        label: "Version originale (VO)",
        key: "original",
        showtimes: showtimes.original,
      });
    }

    if (showtimes.local?.length > 0) {
      versions.push({
        label: "Version locale",
        key: "local",
        showtimes: showtimes.local,
      });
    }

    if (showtimes.multiple?.length > 0) {
      versions.push({
        label: "Versions multiples",
        key: "multiple",
        showtimes: showtimes.multiple,
      });
    }

    return versions;
  };

  // Redirection vers Allociné
  const handleAllocineRedirect = (cinemaId: string) => {
    const allocineUrl = `https://www.allocine.fr/seance/salle_gen_csalle=${cinemaId}.html`;
    window.open(allocineUrl, "_blank");
  };

  return (
    <Dialog open={!!movie} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="line-clamp-1">{movie.title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 overflow-y-auto">
          {/* Affiche et informations principales */}
          <div className="flex-shrink-0 space-y-4">
            {/* Affiche */}
            <div className="w-64 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
                {movie.poster?.url && !imageError ? (
                  <img
                    src={movie.poster.url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <Film className="h-20 w-20 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Informations rapides */}
            <div className="space-y-3">
              {movie.runtime && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{movie.runtime}</span>
                </div>
              )}

              {(movie.stats?.pressReview?.score > 0 ||
                movie.stats?.userRating?.score > 0) && (
                <div className="space-y-2">
                  {movie.stats.pressReview?.score > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {(movie.stats.pressReview.score / 10).toFixed(1)}/5
                      </span>
                      <span className="text-muted-foreground">Presse</span>
                    </div>
                  )}

                  {movie.stats.userRating?.score > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                      <span className="font-medium">
                        {(movie.stats.userRating.score / 10).toFixed(1)}/5
                      </span>
                      <span className="text-muted-foreground">Spectateurs</span>
                    </div>
                  )}
                </div>
              )}

              {/* Genres/Tags */}
              {movie.relatedTags && movie.relatedTags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Genres</div>
                  <div className="flex flex-wrap gap-1">
                    {movie.relatedTags.slice(0, 4).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 space-y-6">
            {/* Synopsis */}
            {movie.synopsisFull && (
              <div className="space-y-2">
                <h3 className="font-semibold">Synopsis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {movie.synopsisFull}
                </p>
              </div>
            )}

            {/* Sélection de date */}
            <div className="space-y-2">
              <h3 className="font-semibold">Séances</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dateOptions.map((option) => (
                  <Button
                    key={option.dayShift}
                    variant={
                      selectedDate === option.dayShift ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedDate(option.dayShift)}
                    className="whitespace-nowrap"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Séances par cinéma */}
            <div className="space-y-4">
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Chargement des séances...
                  </p>
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-destructive">
                  <p>Erreur lors du chargement des séances</p>
                </div>
              )}

              {movieShowtimes?.results && movieShowtimes.results.length > 0 && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {movieShowtimes.results.map((cinema: CinemaShowtimes) => (
                    <Card key={cinema.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">
                              {cinema.name}
                            </CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{cinema.address}</span>
                            </div>
                            {cinema.distance && (
                              <div className="text-xs text-muted-foreground">
                                {cinema.distance}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAllocineRedirect(cinema.id)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Allociné
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="dubbed" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            {cinema.showtimes.dubbed?.length > 0 && (
                              <TabsTrigger value="dubbed">VF</TabsTrigger>
                            )}
                            {cinema.showtimes.original?.length > 0 && (
                              <TabsTrigger value="original">VO</TabsTrigger>
                            )}
                          </TabsList>

                          {formatShowtimesByVersion(cinema.showtimes).map(
                            (version) => (
                              <TabsContent
                                key={version.key}
                                value={version.key}
                                className="mt-3"
                              >
                                <div className="space-y-2">
                                  <div className="text-sm font-medium text-muted-foreground">
                                    {version.label}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {version.showtimes.map(
                                      (showtime, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="px-3 py-1"
                                        >
                                          {new Date(
                                            showtime.startsAt
                                          ).toLocaleTimeString("fr-FR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              </TabsContent>
                            )
                          )}
                        </Tabs>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {movieShowtimes?.results &&
                movieShowtimes.results.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune séance trouvée pour cette date</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
