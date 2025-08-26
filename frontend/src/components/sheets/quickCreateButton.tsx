import { useState } from "react";
import { SheetModal } from "./sheetModal";
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
        {showText && <span className="ml-2">Quick Create Sheet</span>}
      </Button>

      <SheetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode="create"
        sheet={null}
      />
    </>
  );
};