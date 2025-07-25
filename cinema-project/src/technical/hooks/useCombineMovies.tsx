import { useMemo } from "react";
import moment, { Moment } from "moment";
import { Movie } from "@/technical/types";
import { TRAILER_DELAY_MINUTES } from "@/assets/constants";

const getRuntimeInMinutes = (runtime: string): number => {
  const match = runtime.match(/(\d+)h\s*(\d*)min?/);
  if (match) {
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours * 60 + minutes;
  }
  return 0;
};

interface MovieWithTiming extends Movie {
  startTime: Moment;
  endTime: Moment;
}

export const useMovieCombinations = (movies: Movie[], startTime: string) => {
  return useMemo(() => {
    const startMoment = moment(startTime);
    const combinations: MovieWithTiming[][] = [];

    // Get all movies with their showtimes
    const moviesWithTimes: MovieWithTiming[] = movies.flatMap((movie) => {
      const allShowtimes = [
        ...(movie.showtimes.dubbed || []),
        ...(movie.showtimes.original || []),
        ...(movie.showtimes.local || []),
      ];

      return allShowtimes
        .filter((showtime) => showtime && showtime.startsAt)
        .map((showtime) => {
          const movieStartsAt = moment(showtime.startsAt);

          if (!movieStartsAt.isValid() || movieStartsAt.isBefore(startMoment)) {
            return null;
          }

          const runtimeMinutes = getRuntimeInMinutes(movie.runtime);
          if (runtimeMinutes === 0) {
            return null;
          }

          const endTimeMoment = moment(movieStartsAt).add(
            runtimeMinutes + TRAILER_DELAY_MINUTES,
            "minutes"
          );

          return {
            ...movie,
            startTime: movieStartsAt,
            endTime: endTimeMoment,
          };
        })
        .filter((movie): movie is MovieWithTiming => movie !== null);
    });

    // Sort movies by start time
    moviesWithTimes.sort(
      (a, b) => a.startTime.valueOf() - b.startTime.valueOf()
    );

    // Helper function to generate a unique key for a combination
    const generateCombinationKey = (
      first: MovieWithTiming,
      second: MovieWithTiming
    ) =>
      `${first.internalId}_${first.startTime.format("HH:mm")}_${
        second.internalId
      }_${second.startTime.format("HH:mm")}`;

    // Track unique combinations
    const uniqueCombinations = new Set<string>();

    // Find valid combinations
    for (let i = 0; i < moviesWithTimes.length; i++) {
      const firstMovie = moviesWithTimes[i];

      for (let j = i + 1; j < moviesWithTimes.length; j++) {
        const secondMovie = moviesWithTimes[j];

        // Skip if same movie
        if (firstMovie.internalId === secondMovie.internalId) {
          continue;
        }

        // Calculate the gap between movies
        const gap = secondMovie.startTime.diff(firstMovie.endTime, "minutes");

        // Check if there's at least -20 minutes between movies (since we add 20 minutes to the end time of the first movie)
        if (gap >= -20) {
          const combinationKey = generateCombinationKey(
            firstMovie,
            secondMovie
          );

          if (!uniqueCombinations.has(combinationKey)) {
            uniqueCombinations.add(combinationKey);
            combinations.push([firstMovie, secondMovie]);
          }
        }
      }
    }

    return combinations;
  }, [movies, startTime]);
};
