import { useState, useEffect, useMemo, useCallback } from "react";
import { MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { SingleSelect } from "@/components/ui/single-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CinemaSearch } from "@/components/cinema/cinemaSearch";
import { CinemaNextReleases } from "@/app/cinema-agenda/cinemaNextReleases";
import cinemas from "@/data/cinemas.json";
import formerCities from "@/data/french-cities.json";

export default function Cinema() {
  const queryClient = useQueryClient();
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem("VITE_ZIP_CODE") || "";
  });

  // Fonction pour changer de ville et invalider le cache (memoized)
  const handleCityChange = useCallback((newCity: string) => {
    setSelectedCity(newCity);
    // Invalider toutes les queries de cinéma pour forcer le rechargement
    queryClient.invalidateQueries({ queryKey: ["cinema"] });
  }, [queryClient]);

  // Sauvegarder la ville dans localStorage
  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem("VITE_ZIP_CODE", selectedCity);
    }
  }, [selectedCity]);

  const frenchCities = useMemo(() => {
    const uniqueCinemasCities = Array.from(
      new Set(cinemas.map((cinema) => cinema.ville))
    );
    
    const additionalCities = uniqueCinemasCities
      .filter((ville) => !formerCities.some((v) => v.name === ville))
      .map((ville, index) => ({
        id: (100000 + index).toString(),
        name: ville,
      }));
    
    return [...formerCities, ...additionalCities].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, []);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Cinéma
        </h2>
      </div>

      <Tabs defaultValue="seances" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="seances">Séances</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>
        
        <TabsContent value="seances" className="space-y-6 mt-6">
          {/* Sélection de ville */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" aria-hidden="true">Ville sélectionnée</label>
              <SingleSelect
                options={frenchCities.map((city) => ({
                  value: city.id,
                  label: city.name,
                }))}
                selected={selectedCity}
                onChange={handleCityChange}
                placeholder="Rechercher une ville..."
                aria-label="Ville sélectionnée"
              />
            </div>
          </div>

          {/* Résultats des séances */}
          {selectedCity ? (
            <CinemaSearch selectedCity={selectedCity} frenchCities={frenchCities} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Sélectionnez une ville</h3>
              <p className="text-sm">
                Choisissez votre ville pour voir les séances de cinéma disponibles
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="agenda" className="mt-6">
          <CinemaNextReleases />
        </TabsContent>
      </Tabs>
    </div>
  );
}
