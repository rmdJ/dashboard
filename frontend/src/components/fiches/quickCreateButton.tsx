import { useState } from "react";
import { FicheModal } from "./ficheModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface QuickCreateButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  showText?: boolean;
}

export const QuickCreateButton = ({ 
  variant = "default", 
  size = "default", 
  className = "",
  showText = true 
}: QuickCreateButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    console.log("Quick Create button clicked");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        className={className}
      >
        <Plus className="h-4 w-4" />
        {showText && <span className="ml-2">Quick Create</span>}
      </Button>

      <FicheModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode="create"
        fiche={null}
      />
    </>
  );
};