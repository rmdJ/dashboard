import React from "react";
import { Select } from "antd";

const { Option } = Select;

interface SelectCityProps {
  cities: { id: string; name: string }[];
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
  className?: string;
}

export const SelectCity: React.FC<SelectCityProps> = ({
  cities,
  selectedCity,
  setSelectedCity,
  className,
}) => {
  const handleCityChange = (
    _: unknown,
    option:
      | { value: string; key: string }
      | { value: string; key: string }[]
      | undefined
  ) => {
    if (option && !Array.isArray(option)) {
      const cityName = option.value;
      setSelectedCity(cityName);
      localStorage.setItem("VITE_ZIP_CODE", option.key);
    }
  };

  return (
    <Select
      placeholder="Sélectionnez une ville"
      onChange={handleCityChange}
      value={selectedCity}
      showSearch
      className={className}
    >
      {cities
        .filter((city) => city.name !== "Paris")
        .map((city) => (
          <Option key={city.id} value={city.name}>
            {city.name}
          </Option>
        ))}
    </Select>
  );
};
