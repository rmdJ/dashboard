import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Film, X, Calendar, TrendingUp, Users } from "lucide-react";
import type { JSX } from "react";

export interface BaseMovieData {
  title: string;
  originalTitle?: string;
  synopsis?: string;
  runtime?: string | number;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate?: string;
  genres?: Array<{ id: number; name: string }>;
  relatedTags?: Array<{ name: string }>;
  ratings?: {
    press?: { score: number; count: number };
    user?: { score: number; count: number };
    tmdb?: number;
  };
  budget?: number;
  revenue?: number;
  popularity?: number;
  voteCount?: number;
}

interface BaseMovieDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  error?: boolean;
  movieData: BaseMovieData | null;
  children?: React.ReactNode; // Pour du contenu spécifique (séances, etc.)
}

export const BaseMovieDetailsDrawer = ({
  isOpen,
  onClose,
  isLoading = false,
  error = false,
  movieData,
  children,
}: BaseMovieDetailsDrawerProps) => {
  // Fonctions utilitaires partagées
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatRuntime = (runtime: string | number | null) => {
    if (!runtime) return "Non spécifié";
    
    if (typeof runtime === "string") {
      // Format "1h 30min" ou similaire
      return runtime;
    }
    
    // Format en minutes
    const hours = Math.floor(runtime / 60);
    const mins = runtime % 60;
    return `${hours}h ${mins}min`;
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Non divulgué";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fonction pour render les étoiles
  const renderStars = (rating: number, color: string = "yellow") => {
    const stars: JSX.Element[] = [];
    const normalizedRating = rating > 5 ? rating / 2 : rating; // Normaliser si sur 10

    for (let i = 1; i <= 5; i++) {
      const isFull = i <= Math.floor(normalizedRating);
      const isHalf = i === Math.ceil(normalizedRating) && normalizedRating % 1 !== 0;

      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            isFull
              ? `fill-${color}-400 text-${color}-400`
              : isHalf
              ? `fill-${color}-400/50 text-${color}-400`
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </DrawerClose>

          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <p className="text-red-500">Erreur lors du chargement des détails du film</p>
            </div>
          )}

          {movieData && (
            <div className="overflow-y-auto max-h-[80vh]">
              {/* Backdrop pour TMDb */}
              {movieData.backdropUrl && (
                <div className="relative">
                  <div className="w-full h-48 md:h-64 bg-gradient-to-t from-background/80 to-transparent">
                    <img
                      src={movieData.backdropUrl}
                      alt={movieData.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Poster */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    {movieData.posterUrl ? (
                      <img
                        src={movieData.posterUrl}
                        alt={movieData.title}
                        className="w-48 h-72 object-cover rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-48 h-72 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                        <Film className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="flex-1">
                    <DrawerHeader className="px-0 pb-4">
                      <DrawerTitle className="text-2xl md:text-3xl font-bold">
                        {movieData.title}
                      </DrawerTitle>
                      {movieData.originalTitle && movieData.originalTitle !== movieData.title && (
                        <DrawerDescription className="text-lg text-muted-foreground">
                          {movieData.originalTitle}
                        </DrawerDescription>
                      )}
                    </DrawerHeader>

                    {/* Ratings */}
                    {movieData.ratings && (
                      <div className="space-y-3 mb-6">
                        {movieData.ratings.press && movieData.ratings.press.score > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Presse:</span>
                            <div className="flex items-center gap-1">
                              {renderStars(movieData.ratings.press.score, "blue")}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {movieData.ratings.press.score.toFixed(1)}/5
                            </span>
                            {movieData.ratings.press.count > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({movieData.ratings.press.count} avis)
                              </span>
                            )}
                          </div>
                        )}

                        {movieData.ratings.user && movieData.ratings.user.score > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Public:</span>
                            <div className="flex items-center gap-1">
                              {renderStars(movieData.ratings.user.score, "yellow")}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {movieData.ratings.user.score.toFixed(1)}/5
                            </span>
                            {movieData.ratings.user.count > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({movieData.ratings.user.count} avis)
                              </span>
                            )}
                          </div>
                        )}

                        {movieData.ratings.tmdb && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">TMDb:</span>
                            <div className="flex items-center gap-1">
                              {renderStars(movieData.ratings.tmdb, "green")}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {movieData.ratings.tmdb.toFixed(1)}/10
                            </span>
                            {movieData.voteCount && (
                              <span className="text-xs text-muted-foreground">
                                ({movieData.voteCount.toLocaleString()} votes)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Infos générales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {movieData.releaseDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Sortie:</strong> {formatDate(movieData.releaseDate)}
                          </span>
                        </div>
                      )}

                      {movieData.runtime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Durée:</strong> {formatRuntime(movieData.runtime)}
                          </span>
                        </div>
                      )}

                      {movieData.budget && movieData.budget > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Budget:</strong> {formatCurrency(movieData.budget)}
                          </span>
                        </div>
                      )}

                      {movieData.revenue && movieData.revenue > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Recettes:</strong> {formatCurrency(movieData.revenue)}
                          </span>
                        </div>
                      )}

                      {movieData.popularity && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Popularité:</strong> {movieData.popularity.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Genres */}
                    {(movieData.genres?.length || movieData.relatedTags?.length) && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {movieData.genres?.map((genre) => (
                            <Badge key={genre.id} variant="secondary" className="text-xs">
                              {genre.name}
                            </Badge>
                          ))}
                          {movieData.relatedTags?.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Synopsis */}
                    {movieData.synopsis && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2">Synopsis</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {movieData.synopsis}
                        </p>
                      </div>
                    )}

                    {/* Contenu spécifique (séances, etc.) */}
                    {children && (
                      <>
                        <Separator className="my-6" />
                        {children}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};