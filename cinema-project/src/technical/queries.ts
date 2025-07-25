import { CinemaMovies, Movie, ShowtimesByVersion, Theater } from "./types";
import cinemas from "../assets/cinemas.json";
import { themoviedbApiKey } from "../assets/constants";
import { SortOption } from "./types";

export const getMoviePoster = async (
  movieTitle: string,
): Promise<string | null> => {
  try {
    const searchResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${themoviedbApiKey}&query=${movieTitle}`,
    );

    const data = await searchResponse.json();
    const movies = data.results;
    if (movies.length > 0) {
      const movie = movies[0];
      const posterPath = movie.poster_path;
      if (posterPath) {
        return `https://image.tmdb.org/t/p/w500${posterPath}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du poster :", error);
    return null;
  }
};

const fetchAllPages = async (
  url: string,
  params: Record<string, string | number>,
) => {
  let page = 1;
  let allResults: { movie: Movie; showtimes: ShowtimesByVersion }[] = [];
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await fetch(
      `${url}?${new URLSearchParams({ ...params, page: page.toString() })}`,
    );
    const data = await response.json();
    allResults = allResults.concat(data.results);

    if (data.pagination && data.pagination.totalPages > page) {
      page++;
    } else {
      hasMorePages = false;
    }
  }

  return allResults;
};

export const fetchAllCinemaMovies = async (
  selectedDate: Date,
  selectedCinema: string[],
): Promise<CinemaMovies[]> => {
  const allShowtimes = await Promise.all(
    selectedCinema.map(async (cinema) => {
      const allResults = await fetchAllPages(`/api/showtimes`, {
        cinemaId: cinema,
        dayShift: selectedDate.toISOString().split("T")[0],
      });

      const dataWithPosters = await Promise.all(
        allResults
          .filter((movie) => movie.movie !== null)
          .map(async (movie) => ({
            ...movie.movie,
            showtimes: movie.showtimes,
            poster: {
              url:
                movie.movie?.poster?.url ||
                (await getMoviePoster(movie.movie.title)),
            },
            cinemaName: cinemas.find((c) => c.id === cinema)?.nom || cinema,
          })),
      );

      return {
        movies: dataWithPosters,
        cinemaName: cinemas.find((c) => c.id === cinema)?.nom || cinema,
      };
    }),
  );

  return allShowtimes;
};

export const sortCinemaMovies = (
  cinemaMovies: CinemaMovies[],
  sortOption: SortOption,
): CinemaMovies[] => {
  return cinemaMovies.map((cinema) => ({
    ...cinema,
    movies: [...cinema.movies].sort((a, b) => {
      if (sortOption === "userRating") {
        return (
          (b.stats.userRating?.score || 0) - (a.stats.userRating?.score || 0)
        );
      } else {
        return (
          (b.stats.pressReview?.score || 0) - (a.stats.pressReview?.score || 0)
        );
      }
    }),
  }));
};

export const fetchMovieShowtimes = async (
  movieId: number,
  dayShifts: string[],
  zipCode: string,
): Promise<
  {
    date: string;
    show: {
      showtimes: ShowtimesByVersion;
      theater: Theater;
    };
  }[]
> => {
  const promises = dayShifts.map((dayShift) =>
    fetch(
      `/api/movies?movieId=${movieId}&zipCode=${zipCode}&dayShift=${dayShift}`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des horaires du film",
          );
        }
        return response.json();
      })
      .then((data) => {
        return data.results.map(
          (showtime: { showtimes: ShowtimesByVersion; theater: Theater }) => ({
            date: dayShift,
            show: showtime,
          }),
        );
      }),
  );

  const results = await Promise.all(promises);
  return results.flat();
};
