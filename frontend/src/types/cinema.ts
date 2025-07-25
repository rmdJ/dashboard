export interface Movie {
  title: string;
  synopsis: string;
  synopsisFull: string;
  runtime: string;
  stats: {
    userRating: { score: number };
    pressReview: { score: number };
  };
  showtimes: ShowtimesByVersion;
  poster: { url: string | null };
  internalId: number;
  relatedTags: { name: string; scope: string }[];
  languages: string[];
}

export interface ShowtimesByVersion {
  dubbed: Showtime[];    // VF
  original: Showtime[];  // VO  
  local: Showtime[];     // Version locale
  multiple: Showtime[];  // Versions multiples
}

export interface Showtime {
  startsAt: string;
  experience: string[] | null;
  projection: string[];
  diffusionVersion: string;
  internalId: number;
}

export interface Cinema {
  id: string;
  nom: string;
  adresse: string;
  code_postal: string;
  ville: string;
}

export interface City {
  id: string;
  name: string;
}

export interface CombinedShowtime {
  firstMovie: {
    movie: Movie;
    showtime: Showtime;
    cinema: Cinema;
  };
  secondMovie: {
    movie: Movie;
    showtime: Showtime;
    cinema: Cinema;
  };
  gap: number; // minutes between movies
}

export type SortOption = "pressRating" | "userRating" | "title" | "runtime";

export interface CinemaContextType {
  selectedMovies: Movie[];
  setSelectedMovies: (movies: Movie[]) => void;
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  combinedShowtimes: CombinedShowtime[];
  setCombinedShowtimes: (showtimes: CombinedShowtime[]) => void;
}