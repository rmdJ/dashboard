import { Clock } from "lucide-react";
import { Movie } from "@/technical/types";
import { Badge } from "@/components/ui/lib/badge";
import { Review } from "./review";

const MovieCard = ({ movie }: { movie: Movie }) => (
  <div className="flex gap-4">
    <div className="w-[120px] h-38 flex-shrink-0">
      <img
        src={movie.poster.url ?? ""}
        alt={movie.title}
        className="w-full h-full object-cover rounded-lg"
      />
    </div>

    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-lg mb-1 truncate">{movie.title}</h3>

      <div className="flex flex-col gap-3 text-sm text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{movie.runtime}</span>
        </div>
        <div className="flex fllex-start items-center gap-2 max-w-[120px]">
          <Review
            userRating={movie.stats.userRating?.score}
            pressReview={movie.stats.pressReview?.score}
          />
        </div>
      </div>

      <Badge variant="outline" className="rounded-full">
        {movie.startTime?.format("HH:mm")} - {movie.endTime?.format("HH:mm")}
      </Badge>
    </div>
  </div>
);

export const MovieCombination = ({ movies }: { movies: Movie[] }) => {
  if (movies.length !== 2) return null;

  return (
    <div className="bg-white rounded-xl p-4 space-y-6">
      {movies.map((movie) => (
        <MovieCard key={movie.internalId} movie={movie} />
      ))}

      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-dashed border-gray-300"></div>
        <div className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm"></div>
        <div className="flex-1 border-t border-dashed border-gray-300"></div>
      </div>
    </div>
  );
};
