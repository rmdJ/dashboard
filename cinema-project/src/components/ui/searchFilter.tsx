import React, { useEffect, useMemo, useState } from "react";
import { Select, Checkbox, ConfigProvider, Switch } from "antd";
import { trackEvent } from "@/technical/tracking";
import cinemas from "@/assets/cinemas.json";
import { SortOption } from "@/technical/types";
import { SelectCity } from "@/components/ui/selectCity";
import { Film } from "lucide-react";
const { Option } = Select;

interface SearchFilterProps {
  shouldFilterChildrenMovies: boolean;
  setShouldFilterChildrenMovies: (value: boolean) => void;
  selectedWeek: Date | null;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  displayedWeeks: Date[];
  handleWeekChange: (value: number) => void;
  selectedCity: string | null;
  selectedCinema: string[];
  setSelectedCinema: (value: string[]) => void;
  cities: { id: string; name: string }[];
  setSelectedCity: (value: string | null) => void;
  selectedSortOption: SortOption;
  setSelectedSortOption: (option: SortOption) => void;
  isMobile: boolean;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  shouldFilterChildrenMovies,
  setShouldFilterChildrenMovies,
  selectedWeek,
  selectedDate,
  setSelectedDate,
  displayedWeeks,
  handleWeekChange,
  selectedCity,
  selectedCinema,
  setSelectedCinema,
  cities,
  setSelectedCity,
  selectedSortOption,
  setSelectedSortOption,
  isMobile,
}) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const defaultSelectedCinemas = useMemo(() => {
    if (selectedCity) {
      return cinemas
        .filter((cinema) => cinema.ville === selectedCity)
        .map((cinema) => cinema.id);
    }
    return [];
  }, [selectedCity]);

  useEffect(() => {
    setSelectedCinema(defaultSelectedCinemas);
  }, [defaultSelectedCinemas, setSelectedCinema]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (isSelectOpen) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "auto";
        }
      } else {
        document.body.style.overflow = "auto";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "auto";
    };
  }, [isSelectOpen, selectedCity]);

  const onSelectFilterChildrenMovies = (value: boolean) => {
    setShouldFilterChildrenMovies(value);
    trackEvent("Filter children movies", {
      city: selectedCity,
      value,
    });
  };

  return (
    <div className={`flex flex-col ${isMobile ? "p-4" : "p-6 pt-0"}`}>
      <div className="flex items-center gap-2 justify-center my-8">
        <Film className="w-10 h-10 text-white" />
        <h1 className="text-white text-2xl font-bold">Movies Around</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:mt-4 w-full justify-center">
        <SelectCity
          cities={cities}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          className="w-full md:w-1/4"
        />
        {selectedCity && (
          <Select
            mode="multiple"
            placeholder="Sélectionnez un ou plusieurs cinémas"
            value={selectedCinema}
            onChange={(values) => setSelectedCinema(values)}
            onDropdownVisibleChange={(open) => setIsSelectOpen(open)}
            optionFilterProp="children"
            maxTagCount={0}
            maxTagPlaceholder={(omittedValues) =>
              `${omittedValues.length} cinéma${
                omittedValues.length > 1 ? "s" : ""
              } sélectionné${omittedValues.length > 1 ? "s" : ""}`
            }
            dropdownStyle={{ background: "#18181b", color: "#fff" }}
            className="w-full md:w-1/4 h-[33px]"
          >
            {cinemas
              .filter((cinema) => cinema.ville === selectedCity)
              .map((cinema) => (
                <Option key={cinema.id} value={cinema.id}>
                  {cinema.nom}
                </Option>
              ))}
          </Select>
        )}
        <Select
          placeholder="Sélectionnez une semaine"
          onChange={handleWeekChange}
          onDropdownVisibleChange={(open) => setIsSelectOpen(open)}
          value={
            selectedWeek
              ? displayedWeeks.findIndex(
                  (week) => week.toDateString() === selectedWeek.toDateString()
                )
              : undefined
          }
          disabled={!selectedCity}
          className="w-full md:w-1/4 bg-neutral-800 text-white border-none"
        >
          {displayedWeeks.map((week, index) => {
            const weekRange = `${week.getDate()}/${week.getMonth() + 1}`;
            return (
              <Option key={index} value={index}>
                Semaine du {weekRange}
              </Option>
            );
          })}
        </Select>
        {selectedWeek && (
          <Select
            placeholder="Sélectionnez un jour"
            onChange={(value) => setSelectedDate(new Date(value))}
            onDropdownVisibleChange={(open) => setIsSelectOpen(open)}
            value={selectedDate?.toISOString()}
            disabled={!selectedCity}
            className="w-full md:w-1/4 bg-neutral-800 text-white border-none"
          >
            {Array.from({ length: 7 }, (_, index) => {
              const date = new Date(selectedWeek);
              date.setDate(date.getDate() + index);
              const formattedDate = date.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
              });
              const capitalizedFormattedDate =
                formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
              return (
                <Option key={date.toISOString()} value={date.toISOString()}>
                  {capitalizedFormattedDate}
                </Option>
              );
            })}
          </Select>
        )}
      </div>
      <div className="flex items-center justify-center gap-8 mt-4">
        <div className="flex items-center justify-between">
          <span
            className={
              selectedSortOption === "userRating"
                ? "text-white font-bold"
                : "text-neutral-50"
            }
          >
            Note Spect.
          </span>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#404040",
                borderRadius: 2,
                colorBorderBg: "#404040",
                colorBgContainer: "#404040",
              },
            }}
          >
            <Switch
              checked={selectedSortOption === "pressRating"}
              onChange={(checked) =>
                setSelectedSortOption(checked ? "pressRating" : "userRating")
              }
              className="mx-4"
            />
          </ConfigProvider>
          <span
            className={
              selectedSortOption === "pressRating"
                ? "text-white font-bold"
                : "text-neutral-50"
            }
          >
            Note Presse
          </span>
        </div>

        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#404040",
              borderRadius: 2,
              colorBorderBg: "#404040",
            },
          }}
        >
          <Checkbox
            checked={shouldFilterChildrenMovies}
            onChange={(e) => onSelectFilterChildrenMovies(e.target.checked)}
            className="text-sm text-white font-bold"
          >
            Filtrer les films pour enfants
          </Checkbox>
        </ConfigProvider>
      </div>
    </div>
  );
};
