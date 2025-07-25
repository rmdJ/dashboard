import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CinemaSearch } from "../../components/cinema/cinema-search";
import frenchCities from "../../data/french-cities.json";

export default function Cinema() {
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem("VITE_ZIP_CODE") || "";
  });

  // Sauvegarder la ville dans localStorage
  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem("VITE_ZIP_CODE", selectedCity);
    }
  }, [selectedCity]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Séances Cinéma
        </h2>
      </div>

      {/* Sélection de ville */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ville sélectionnée</label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <SelectValue placeholder="Sélectionnez une ville" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <div className="max-h-80 overflow-y-auto">
                {frenchCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{city.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Résultats des séances */}
      {selectedCity ? (
        <CinemaSearch selectedCity={selectedCity} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Sélectionnez une ville</h3>
          <p className="text-sm">
            Choisissez votre ville pour voir les séances de cinéma disponibles
          </p>
        </div>
      )}
    </div>
  );
}
