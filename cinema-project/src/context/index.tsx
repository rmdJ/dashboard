/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, ReactNode } from "react";
import { Movie } from "../technical/types";

interface AppContextProps {
  displayedDates: Date[];
  setDisplayedDates: React.Dispatch<React.SetStateAction<Date[]>>;
  selectedMovie: Movie | null;
  setSelectedMovie: React.Dispatch<React.SetStateAction<Movie | null>>;
  showtimesCache: Record<string, any>;
  setShowtimesCache: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [displayedDates, setDisplayedDates] = useState<Date[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showtimesCache, setShowtimesCache] = useState<Record<string, any>>({});

  const value = React.useMemo(
    () => ({
      displayedDates,
      setDisplayedDates,
      selectedMovie,
      setSelectedMovie,
      showtimesCache,
      setShowtimesCache,
    }),
    [displayedDates, selectedMovie, showtimesCache]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
