import { useState, useMemo, useEffect, useCallback } from "react";
import { Layout, Card } from "antd";
import { Skeleton } from "@/components/ui/lib/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCinemaMovies, sortCinemaMovies } from "@/technical/queries";
import { Movie, SortOption, CinemaMovies } from "@/technical/types";
import { SearchFilter } from "@/components/ui/searchFilter";
import formerCities from "@/assets/formerCities.json";
import cinemas from "@/assets/cinemas.json";
import { LayoutCinema } from "@/components/layout/cinema";
import { weeks } from "@/technical/helpers";
import { initAnalytics, trackEvent } from "@/technical/tracking";
import { useAppContext } from "@/context/appContext";
import { Showtimes } from "@/pages/showTimes";
import useScrollLock from "@/technical/hooks/useScrollLock";
import moment from "moment";
import { Pill } from "@/components/ui/pill";
import { MovieBottomSheet } from "@/components/ui/movieBottomSheet";
import { CitySelection } from "@/pages/citySelection";
import { SkeletonCinemaCard } from "@/components/ui/SkeletonCinemaCard";

export const Home = () => {
  const { setDisplayedDates, setSelectedMovie, setShowtimesCache } =
    useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  useScrollLock(isModalVisible);
  const displayedWeeks = useMemo(() => weeks(), []);
  const [shouldFilterChildrenMovies, setShouldFilterChildrenMovies] =
    useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);

  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const now = moment();
    return now.format("HH:00");
  });

  const frenchCities = useMemo(() => {
    const additionalCities = Array.from(
      new Set(cinemas.map((cinema) => cinema.ville))
    )
      .filter((ville) => !formerCities.some((v) => v.name === ville))
      .map((ville, index) => ({
        id: (100000 + index).toString(),
        name: ville,
      }));

    return [...formerCities, ...additionalCities].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, []);

  const [selectedCity, setSelectedCity] = useState<string | null>(
    frenchCities.find((c) => c.id === localStorage.getItem("VITE_ZIP_CODE"))
      ?.name ?? null
  );

  const [sortOption, setSortOption] = useState<SortOption>("pressRating");

  const resetState = useCallback(() => {
    setSelectedMovies([]);
    setSelectedTime(moment().format("HH:00"));
  }, []);

  useEffect(() => {
    resetState();
  }, [selectedDate, resetState]);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (displayedWeeks.length > 0 && !selectedWeek) {
      const firstWeek = displayedWeeks[0];
      setSelectedWeek(firstWeek);
      const firstDayOfWeek = new Date(firstWeek);
      setSelectedDate(firstDayOfWeek);
      setDisplayedDates(
        Array.from({ length: 7 }, (_, index) => {
          const date = new Date(firstWeek);
          date.setDate(date.getDate() + index);
          return date;
        })
      );
    }
  }, [displayedWeeks, selectedWeek, setDisplayedDates]);

  const handleMovieSelection = (movie: Movie) => {
    setSelectedMovies((prevSelectedMovies) => {
      const movieIndex = prevSelectedMovies.findIndex(
        (selectedMovie) =>
          selectedMovie.internalId === movie.internalId &&
          selectedMovie.cinemaName === movie.cinemaName
      );
      if (movieIndex === -1) {
        return [...prevSelectedMovies, movie];
      } else {
        return prevSelectedMovies.filter((_, index) => index !== movieIndex);
      }
    });
  };

  const { data: cinemaMovies, isFetching } = useQuery({
    queryKey: [
      "cinemaMovies",
      selectedDate?.toISOString() ?? selectedWeek?.toISOString(),
      selectedCinema.join(","),
    ],
    queryFn: () => {
      if (selectedDate && selectedWeek && selectedCinema) {
        return fetchAllCinemaMovies(selectedDate, selectedCinema);
      }
      return Promise.resolve(null);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedDate && !!selectedWeek && !!selectedCinema,
    placeholderData: (previousData) => previousData,
  });

  const sortedCinemaMovies: CinemaMovies[] | null = useMemo(() => {
    if (!cinemaMovies) return null;
    return sortCinemaMovies(cinemaMovies, sortOption);
  }, [cinemaMovies, sortOption]);

  const handleWeekChange = (weekIndex: number) => {
    const week = displayedWeeks[weekIndex];
    setSelectedWeek(week);
    setSelectedDate(week);
    setDisplayedDates(
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(week);
        date.setDate(date.getDate() + index);
        return date;
      })
    );
  };

  const onPosterClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
    trackEvent("Movie Selected", {
      city: selectedCity,
      cinema: selectedCinema,
      movieTitle: movie.title,
      date: selectedDate?.toISOString(),
    });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedMovie(null);
  };

  if (localStorage.getItem("VITE_ZIP_CODE") === null) {
    return (
      <CitySelection
        cities={frenchCities}
        onCitySelect={(city) => setSelectedCity(city)}
      />
    );
  }

  return (
    <Layout className="min-h-screen overflow-x-hidden bg-neutral-800">
      <div className="w-full md:max-w-[1400px] md:mx-auto bg-neutral-800">
        <SearchFilter
          shouldFilterChildrenMovies={shouldFilterChildrenMovies}
          setShouldFilterChildrenMovies={setShouldFilterChildrenMovies}
          selectedWeek={selectedWeek}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          displayedWeeks={displayedWeeks}
          handleWeekChange={handleWeekChange}
          selectedCity={selectedCity}
          setSelectedCity={(value) => {
            setSelectedCity(value);
            setShowtimesCache({});
          }}
          selectedCinema={selectedCinema}
          setSelectedCinema={setSelectedCinema}
          cities={frenchCities}
          selectedSortOption={sortOption}
          setSelectedSortOption={setSortOption}
          isMobile={true}
        />
      </div>

      {/* Main Content */}
      <main className="w-full bg-neutral-800">
        <div className="max-w-[1400px] mx-auto px-0 md:px-6 md:mt-4 md:mt-0">
          {isFetching ? (
            <div className="flex flex-col gap-8 p-4">
              <div className="flex py-4 justify-center">
                <Skeleton className="h-6 w-1/2 mb-4 border border-gray-300" />
              </div>
              <div className="flex gap-8">
                {[...Array(3)].map((_, index) => (
                  <Card className="flex flex-col w-[260px]" key={index}>
                    <SkeletonCinemaCard />
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 md:py-0">
              {sortedCinemaMovies?.map((cinema) => (
                <LayoutCinema
                  key={cinema.cinemaName}
                  cinema={cinema}
                  onPosterClick={onPosterClick}
                  shouldFilterChildrenMovies={shouldFilterChildrenMovies}
                  selectedMovies={selectedMovies}
                  handleMovieSelection={handleMovieSelection}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Showtimes isVisble={isModalVisible} onClose={handleModalClose} />
      <Pill
        onClick={() => setBottomSheetOpen(true)}
        selectedCount={selectedMovies.length}
      />
      <MovieBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        selectedMovies={selectedMovies}
        onTimeSelect={(time) => setSelectedTime(moment(time).format("HH:00"))}
        selectedTime={selectedTime}
      />
    </Layout>
  );
};
