import { useMovieDetails } from "@/hooks/useMovieDetails";
import { 
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerHeader, 
  DrawerTitle,
  DrawerClose 
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Star, 
  TrendingUp, 
  Clock, 
  Users, 
  Film,
  X 
} from "lucide-react";

interface MovieDetailsDrawerProps {
  movieId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MovieDetailsDrawer = ({ movieId, isOpen, onClose }: MovieDetailsDrawerProps) => {
  const { data: movie, isLoading, error } = useMovieDetails(movieId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return "Non spécifié";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
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

          {movie && (
            <div className="overflow-y-auto max-h-[80vh]">
              <div className="relative">
                {movie.backdrop_path && (
                  <div className="w-full h-48 md:h-64 bg-gradient-to-t from-background/80 to-transparent">
                    <img
                      src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Poster */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-48 h-72 object-cover rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-48 h-72 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                        <Film className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="flex-1">
                    <DrawerHeader className="px-0 pb-4">
                      <DrawerTitle className="text-2xl md:text-3xl font-bold">
                        {movie.title}
                      </DrawerTitle>
                      {movie.original_title !== movie.title && (
                        <DrawerDescription className="text-lg text-muted-foreground">
                          {movie.original_title}
                        </DrawerDescription>
                      )}
                      {movie.tagline && (
                        <p className="text-muted-foreground italic">"{movie.tagline}"</p>
                      )}
                    </DrawerHeader>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.map((genre) => (
                        <Badge key={genre.id} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({movie.vote_count.toLocaleString()})
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">{Math.round(movie.popularity)}</span>
                        <span className="text-sm text-muted-foreground">popularité</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(movie.release_date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{formatRuntime(movie.runtime)}</span>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Synopsis */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {movie.overview || "Aucun synopsis disponible."}
                      </p>
                    </div>

                    {/* Informations supplémentaires */}
                    {(movie.budget > 0 || movie.revenue > 0) && (
                      <>
                        <Separator className="my-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {movie.budget > 0 && (
                            <div>
                              <h4 className="font-medium mb-1">Budget</h4>
                              <p className="text-muted-foreground">{formatCurrency(movie.budget)}</p>
                            </div>
                          )}
                          {movie.revenue > 0 && (
                            <div>
                              <h4 className="font-medium mb-1">Recettes</h4>
                              <p className="text-muted-foreground">{formatCurrency(movie.revenue)}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Production */}
                    {movie.production_companies.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Production
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {movie.production_companies.map((company) => (
                              <Badge key={company.id} variant="outline">
                                {company.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
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