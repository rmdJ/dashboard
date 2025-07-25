import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ToggleYesNoProps {
  value: boolean;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  className?: string;
}

export function ToggleYesNo({
  value,
  onChange,
  yesLabel = "Oui",
  noLabel = "Non",
  className,
}: ToggleYesNoProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        variant={value ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(true)}
        className="flex items-center gap-2"
      >
        <Check className="h-4 w-4" />
        {yesLabel}
      </Button>
      <Button
        variant={!value ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(false)}
        className="flex items-center gap-2"
      >
        <X className="h-4 w-4" />
        {noLabel}
      </Button>
    </div>
  );
}