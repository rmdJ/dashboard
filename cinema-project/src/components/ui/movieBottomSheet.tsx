import React, { useMemo } from "react";
import { Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/lib/sheet";
import { Movie } from "@/technical/types";
import { useMovieCombinations } from "@/technical/hooks/useCombineMovies";
import { MovieCombination } from "@/components/ui/movieCombination";

// const AVAILABLE_TIMES = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

interface MovieBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMovies: Movie[];
  onTimeSelect: (time: string) => void;
  selectedTime: string;
}

export const MovieBottomSheet: React.FC<MovieBottomSheetProps> = ({
  isOpen,
  onClose,
  selectedMovies,
  onTimeSelect,
  selectedTime,
}) => {
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 11; hour <= 20; hour++) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;
      options.push(timeStr);
    }
    return options;
  }, []);
  const combinations = useMovieCombinations(selectedMovies || [], selectedTime);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-xl px-4 py-6 max-h-[90vh] overflow-y-auto"
      >
        <SheetHeader className="flex justify-between items-center mb-6">
          <SheetTitle>Combiner les séances</SheetTitle>
        </SheetHeader>

        {/* Selected Movies */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-gray-500">
            Films sélectionnés
          </h3>
          <div className="flex gap-4 overflow-x-auto py-2 snap-x">
            {selectedMovies.map((movie) => (
              <div
                key={movie.internalId}
                className="flex-shrink-0 snap-start w-32 space-y-2"
              >
                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                  {movie.poster && (
                    <img
                      src={movie.poster.url ?? ""}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="text-sm font-medium line-clamp-1">
                  {movie.title}
                </p>
                <p className="text-sm font-medium line-clamp-1">
                  {movie.cinemaName}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-4 mb-8 hidden">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>À partir de</span>
          </div>
          <div className="flex gap-2 overflow-x-auto snap-x py-2">
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => onTimeSelect(time)}
                className={`flex-shrink-0 snap-start px-6 py-2 border rounded-full
                hover:bg-gray-50 focus:bg-gray-50 focus:border-blue-500
                transition-colors duration-200 ${
                  selectedTime === time ? "bg-gray-800 text-white" : "bg-white"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {combinations && combinations.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Combinaisons disponibles</h3>
            <div className="space-y-4 overflow-y-auto max-h-[90vh]">
              {combinations.map((combo, index) => (
                <MovieCombination key={index} movies={combo} />
              ))}
            </div>
          </div>
        )}

        {combinations && combinations.length === 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-md font-medium">
              Aucune combinaison de films trouvée.
            </h3>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
