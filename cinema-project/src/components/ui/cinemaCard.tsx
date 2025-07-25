import { Film } from "lucide-react";
import { Movie } from "@/technical/types";
import { TimePeriod } from "./timePeriod";
import { Card, CardContent, CardFooter, CardHeader } from "./lib/card";
import { Separator } from "./separator";
import { Badge } from "@/components/ui/lib/badge";
import { Button } from "@/components/ui/lib/button";
import { Review } from "./review";

export const CinemaCard = ({
  movie,
  onPosterClick,
  onSelectMovie,
  isMovieSelected,
}: {
  movie: Movie;
  onPosterClick: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
  isMovieSelected: boolean;
}) => {
  return (
    <Card className="flex flex-col h-full w-[260px] md:w-full">
      <CardHeader className="p-0 relative">
        <img
          alt={`${movie.title} poster`}
          src={movie.poster?.url ?? ""}
          className="h-[250px] md:h-[350px] object-cover md:hover:cursor-pointer md:hover:shadow-lg"
          onClick={() => onPosterClick(movie)}
        />
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-0 text-sm text-muted-foreground">
          {movie.relatedTags &&
            movie.relatedTags.length > 0 &&
            movie.relatedTags.filter((tag) =>
              tag.name.startsWith("À partir de")
            ).length > 0 && (
              <>
                {movie.relatedTags
                  .filter((tag) => tag.name.startsWith("À partir de"))
                  .map((tag) => (
                    <Badge key={tag.name} className="mb-2">
                      {tag.name}
                    </Badge>
                  ))}
              </>
            )}
          <Badge variant="secondary" className="rounded-full">
            <Film size={14} className="mr-1" />
            {movie.runtime}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 py-3">
        <Review
          userRating={movie.stats.userRating?.score}
          pressReview={movie.stats.pressReview?.score}
        />
      </CardContent>
      <Separator />
      <CardContent className="p-4 pb-2">
        {Object.entries(movie.showtimes)
          .filter(([version]) => version !== "multiple")
          .map(
            ([version, showtimes]) =>
              Array.isArray(showtimes) &&
              showtimes.length > 0 && (
                <div
                  key={version}
                  className="flex flex-wrap gap-x-1 gap-y-2 mb-4"
                >
                  <div className="flex">
                    <Badge variant="secondary" className="rounded-full">
                      {version === "dubbed" ||
                      (movie.languages.length === 1 &&
                        movie.languages[0] === "FRENCH")
                        ? "VF"
                        : "VO"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-1 gap-y-2">
                    {showtimes.map((st) => (
                      <TimePeriod
                        key={st.internalId}
                        startsAt={st.startsAt}
                        runtime={movie?.runtime ?? null}
                      />
                    ))}
                  </div>
                </div>
              )
          )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          type="button"
          variant={isMovieSelected ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onSelectMovie(movie);
          }}
          className="w-full"
        >
          {isMovieSelected ? "Déselectionner" : "Sélectionner"}
        </Button>
      </CardFooter>
    </Card>
  );
};
