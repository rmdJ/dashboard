import React, { useState } from "react";
import { Button } from "@/components/ui/lib/button";
import { SelectCity } from "@/components/ui/selectCity";

export const CitySelection: React.FC<{
  onCitySelect: (city: string) => void;
  cities: { id: string; name: string }[];
}> = ({ onCitySelect, cities }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-800 text-white gap-4">
      <h1 className="text-2xl font-bold">Sélectionnez une ville</h1>
      <SelectCity
        cities={cities}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />
      <Button
        onClick={() => {
          if (selectedCity) {
            onCitySelect(selectedCity);
          }
        }}
        disabled={!selectedCity}
        variant="outline"
        className="bg-white text-neutral-700"
      >
        Valider
      </Button>
    </div>
  );
};
