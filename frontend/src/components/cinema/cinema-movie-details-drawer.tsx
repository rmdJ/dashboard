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
import { Star, Clock, Film, X } from "lucide-react";
import type { Movie } from "../../types/cinema";
import type { JSX } from "react";

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

  // Fonction pour render les étoiles
  const renderStars = (rating: number, color: string = "yellow") => {
    const stars: JSX.Element[] = [];

    for (let i = 1; i <= 5; i++) {
      const isFull = i <= Math.floor(rating);
      const isHalf = i === Math.ceil(rating) && rating % 1 !== 0;

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

          <div className="overflow-y-auto max-h-[80vh]">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={title}
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
                      {title}
                    </DrawerTitle>
                    {originalTitle && originalTitle !== title && (
                      <DrawerDescription className="text-lg text-muted-foreground">
                        {originalTitle}
                      </DrawerDescription>
                    )}
                  </DrawerHeader>

                  {/* Tags/Genres */}
                  {relatedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {relatedTags
                        .slice(0, 6)
                        .map((tag: any, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                    </div>
                  )}

                  {/* Durée */}
                  {runtime && (
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{runtime}</span>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {pressRating > 0 && (
                      <div className="text-center">
                        <h4 className="font-medium mb-2">Note Presse</h4>
                        <div className="text-2xl font-bold mb-2">
                          {pressRating}/5
                        </div>
                        <div className="flex justify-center mb-1">
                          {renderStars(pressRating, "yellow")}
                        </div>
                        {pressCount > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {pressCount} critique{pressCount > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    )}

                    {userRating > 0 && (
                      <div className="text-center">
                        <h4 className="font-medium mb-2">Note Public</h4>
                        <div className="text-2xl font-bold mb-2">
                          {userRating}/5
                        </div>
                        <div className="flex justify-center mb-1">
                          {renderStars(userRating, "yellow")}
                        </div>
                        {userCount > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {userCount} avis
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Synopsis */}
                  {synopsis && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
                      <div
                        className="text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: synopsis }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
