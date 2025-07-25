// components/ui/Pill.tsx
import { ChevronUp } from "lucide-react";
import React from "react";

interface PillProps {
  selectedCount: number;
  onClick: () => void;
}

export const Pill: React.FC<PillProps> = ({ selectedCount, onClick }) => {
  if (selectedCount < 2) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher tout comportement par défaut
    e.stopPropagation(); // Empêcher la propagation de l'événement
    onClick();
  };

  return (
    <>
      {/* Zone de sécurité pour le scroll */}
      <div className="h-20 w-full md:hidden bg-neutral-800" />

      {/* Container avec une grande zone touchable */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 
                   flex items-center justify-center 
                   py-6 px-4 touch-none"
        onClick={handleClick}
      >
        {/* Pill avec padding augmenté pour une meilleure zone de touch */}
        <button
          className="bg-neutral-800 text-white 
                     shadow-lg rounded-full
                     flex items-center gap-2
                     px-6 py-4 
                     min-h-[48px]
                     active:scale-95
                     transition-transform duration-200
                     touch-none
                     -translate-y-6"
          type="button"
          aria-label="Voir les combinaisons"
        >
          <span className="text-base font-medium whitespace-nowrap">
            {selectedCount} films sélectionnés
          </span>
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};
