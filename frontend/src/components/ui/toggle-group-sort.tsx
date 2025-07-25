import * as React from "react";
import { Star, Clock, Type, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SortOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface ToggleGroupSortProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  className?: string;
}

export function ToggleGroupSort({
  value,
  onChange,
  options,
  className,
}: ToggleGroupSortProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
          className="flex items-center gap-2"
        >
          {option.icon}
          {option.label}
        </Button>
      ))}
    </div>
  );
}

// Options de tri prédéfinies pour les films
export const sortOptions: SortOption[] = [
  {
    value: "pressRating",
    label: "Note presse",
    icon: <Star className="h-4 w-4" />,
  },
  {
    value: "userRating", 
    label: "Note public",
    icon: <TrendingUp className="h-4 w-4" />,
  },
];