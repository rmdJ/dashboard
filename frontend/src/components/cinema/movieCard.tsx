import { useState } from "react";
import { Star, Plus, Check, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CinemaMovieDetailsDrawer } from "./cinemaMovieDetailsDrawer";
import type { Movie, Showtime } from "../../types/cinema";

interface MovieCardProps {
  movie: Movie;
  isSelected: boolean;
  onSelect: () => void;
  canSelect: boolean;
}

export function MovieCard({
  movie,
  isSelected,
  onSelect,
  canSelect,
}: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  // Extraire les séances selon la vraie structure
  const showtimes = movie.showtimes || {};
  let vfShowtimes = [...(showtimes.dubbed || [])];
  const voShowtimes = showtimes.original || [];
  const multipleShowtimes = showtimes.multiple || [];
  const localShowtimes = showtimes.local || [];

  // Ajouter les séances LOCAL aux séances VF
  const localVFShowtimes = localShowtimes.filter(
    (showtime: any) => showtime.diffusionVersion === "LOCAL"
  );
  vfShowtimes = [...vfShowtimes, ...localVFShowtimes];

  // Ajouter les séances MULTIPLE avec diffusionVersion LOCAL aux VF
  const multipleVFShowtimes = multipleShowtimes.filter(
    (showtime: any) => showtime.diffusionVersion === "LOCAL"
  );
  vfShowtimes = [...vfShowtimes, ...multipleVFShowtimes];

  // Formater les horaires avec début et fin (toutes les séances, sans doublons)
  const formatShowtimes = (showtimes: Showtime[]): string[] => {
    const times = showtimes.map((showtime) => {
      const startDate = new Date(showtime.startsAt);
      const startTime = startDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Calculer l'heure de fin : runtime + 20 minutes
      const runtimeMinutes = parseRuntime(runtime);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + runtimeMinutes + 20);
      const endTime = endDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `${startTime} - ${endTime}`;
    });

    // Supprimer les doublons et trier par heure
    return [...new Set(times)].sort();
  };

  // Fonction pour parser la durée (ex: "2h 15min" -> 135 minutes)
  const parseRuntime = (runtimeStr: string): number => {
    if (!runtimeStr) return 120; // Durée par défaut: 2h

    const hourMatch = runtimeStr.match(/(\d+)h/);
    const minuteMatch = runtimeStr.match(/(\d+)min/);

    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

    return hours * 60 + minutes;
  };

  // Extraire les notes et compteurs
  const pressRating =
    (movie as any).movie?.stats?.pressReview?.score ||
    movie.stats?.pressReview?.score ||
    0;
  const userRating =
    (movie as any).movie?.stats?.userRating?.score ||
    movie.stats?.userRating?.score ||
    0;

  // Extraire la durée
  const runtime = (movie as any).movie?.runtime || movie.runtime || "";

  // URL de l'affiche avec fallback TMDB
  const posterUrl = (movie as any).movie?.poster?.url || null;

  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg !p-0">
      <CardContent className="p-0">
        {/* Affiche du film */}
        <div
          className="relative aspect-[2/3] overflow-hidden rounded-t-lg cursor-pointer"
          onClick={() => setShowDetailsDrawer(true)}
        >
          {posterUrl && !imageError ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
              <Film className="h-16 w-16 text-gray-400 dark:text-gray-600" />
            </div>
          )}

          {/* Overlay avec actions */}
          {canSelect && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Button
                size="sm"
                variant={isSelected ? "destructive" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                {isSelected ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Sélectionné
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Sélectionner
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Badge de sélection */}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          )}

          {/* Badge âge en bas à gauche */}
          {(() => {
            const movieData = (movie as any).movie || movie;
            const ageTag = movieData.relatedTags?.find((tag: any) =>
              tag.name.startsWith("À partir de")
            );

            if (ageTag) {
              return (
                <div className="absolute bottom-10 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                  {ageTag.name}
                </div>
              );
            }
            return null;
          })()}

          {/* Badge durée en bas à droite */}
          {runtime && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <Film className="h-3 w-3" />
              <span>{runtime}</span>
            </div>
          )}
        </div>

        {/* Informations du film */}
        <div className="p-4 space-y-3">
          {/* Notes */}
          <div className="flex justify-between text-sm">
            {pressRating > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-muted-foreground mb-1">
                  Presse
                </span>
                <span className="font-medium text-base mb-1">
                  {pressRating}
                </span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFull = star <= Math.floor(pressRating);
                    const isHalf =
                      star === Math.ceil(pressRating) && pressRating % 1 !== 0;

                    return (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          isFull
                            ? "fill-yellow-400 text-yellow-400"
                            : isHalf
                            ? "fill-yellow-400/50 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {userRating > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-muted-foreground mb-1">
                  Public
                </span>
                <span className="font-medium text-base mb-1">{userRating}</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFull = star <= Math.floor(userRating);
                    const isHalf =
                      star === Math.ceil(userRating) && userRating % 1 !== 0;

                    return (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          isFull
                            ? "fill-yellow-400 text-yellow-400"
                            : isHalf
                            ? "fill-yellow-400/50 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* Horaires séparés par version */}
          {(vfShowtimes.length > 0 || voShowtimes.length > 0) && (
            <div className="space-y-3">
              {/* Séances VF */}
              {vfShowtimes.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Badge variant="outline" className="text-xs p-1">
                      VF
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatShowtimes(vfShowtimes).map((time, index) => (
                      <Badge
                        key={`vf-${index}`}
                        variant="secondary"
                        className="text-xs px-2 py-1"
                      >
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Séances VO */}
              {voShowtimes.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Badge variant="outline" className="text-xs p-1">
                      VO
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatShowtimes(voShowtimes).map((time, index) => (
                      <Badge
                        key={`vo-${index}`}
                        variant="secondary"
                        className="text-xs px-2 py-1"
                      >
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Drawer des détails du film */}
      <CinemaMovieDetailsDrawer
        movie={movie}
        isOpen={showDetailsDrawer}
        onClose={() => setShowDetailsDrawer(false)}
      />
    </Card>
  );
}
