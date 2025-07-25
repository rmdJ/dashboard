import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import frenchCities from "../../data/french-cities.json";

interface CitySelectionProps {
  onCitySelect: (cityId: string) => void;
}

export function CitySelection({ onCitySelect }: CitySelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  // Filtrer les villes selon la recherche
  const filteredCities = frenchCities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50); // Limiter à 50 résultats pour les performances

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
  };

  const handleConfirm = () => {
    if (selectedCity) {
      onCitySelect(selectedCity);
    }
  };

  const selectedCityName = frenchCities.find(city => city.id === selectedCity)?.name;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Choisissez votre ville
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez votre ville pour consulter les séances de cinéma
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full space-y-6">
        {/* Recherche */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Rechercher une ville</label>
          <Input
            placeholder="Tapez le nom de votre ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Sélection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ville sélectionnée</label>
          <Select value={selectedCity} onValueChange={handleCitySelect}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sélectionnez une ville" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <div className="max-h-64 overflow-y-auto">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{city.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Aucune ville trouvée
                  </div>
                )}
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Aperçu de la sélection */}
        {selectedCityName && (
          <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">Ville sélectionnée :</span>
              <span className="text-primary">{selectedCityName}</span>
            </div>
          </div>
        )}

        {/* Bouton de confirmation */}
        <Button 
          onClick={handleConfirm} 
          disabled={!selectedCity}
          className="w-full"
          size="lg"
        >
          Confirmer ma ville
        </Button>

        {/* Villes populaires */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Villes populaires
          </div>
          <div className="grid grid-cols-2 gap-2">
            {frenchCities
              .filter(city => ["115755", "113315", "87914", "96373", "97612", "85327"].includes(city.id))
              .map((city) => (
                <Button
                  key={city.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCitySelect(city.id)}
                  className="justify-start text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {city.name}
                </Button>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}