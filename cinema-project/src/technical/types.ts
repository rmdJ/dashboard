import { Moment } from "moment";

export type Showtime = {
  startsAt: string;
  experience: string[] | null;
  comfort: null;
  projection: string[];
  diffusionVersion: string;
  isPreview: boolean;
  isWeeklyMovieOuting: boolean;
  internalId: number;
};

export type ShowtimesByVersion = {
  dubbed: Showtime[];
  original: Showtime[];
  local: Showtime[];
  multiple: Showtime[];
};

export type Movie = {
  title: string;
  synopsis: string;
  synopsisFull: string;
  runtime: string;
  stats: {
    userRating: {
      score: number;
    };
    pressReview: {
      score: number;
    };
  };
  showtimes: ShowtimesByVersion;
  poster: {
    url: string | null;
  };
  internalId: number;
  relatedTags: {
    name: string;
    scope: string;
  }[];
  languages: string[];
  startTime?: Moment;
  endTime?: Moment;
  cinemaName?: string;
  posterUrl?: string;
};

export type CinemaMovies = {
  movies: Movie[];
  cinemaName: string;
};

export type Theater = {
  id: number;
  name: string;
  poster: {
    url: string;
  };
  location: {
    city: string;
  };
};

export type SortOption = "userRating" | "pressRating";
